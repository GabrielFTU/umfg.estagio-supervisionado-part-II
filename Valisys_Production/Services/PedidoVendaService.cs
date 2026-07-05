using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class PedidoVendaService : IPedidoVendaService
    {
        private readonly IPedidoVendaRepository _repository;
        private readonly ILogSistemaService _log;
        private readonly IContaReceberService _contaReceberService;
        private readonly ICondicaoPagamentoRepository _condicaoPagamentoRepository;
        private readonly IFormaPagamentoRepository _formaPagamentoRepository;
        private readonly ILoteRepository _loteRepository;
        private readonly IProdutoRepository _produtoRepository;

        public PedidoVendaService(IPedidoVendaRepository repository, ILogSistemaService log,
            IContaReceberService contaReceberService, ICondicaoPagamentoRepository condicaoPagamentoRepository,
            IFormaPagamentoRepository formaPagamentoRepository, ILoteRepository loteRepository,
            IProdutoRepository produtoRepository)
        {
            _repository = repository;
            _log = log;
            _contaReceberService = contaReceberService;
            _condicaoPagamentoRepository = condicaoPagamentoRepository;
            _formaPagamentoRepository = formaPagamentoRepository;
            _loteRepository = loteRepository;
            _produtoRepository = produtoRepository;
        }

        public async Task<PedidoVenda> CreateAsync(PedidoVendaCreateDto dto, Guid usuarioId)
        {
            if (dto.ClienteId == Guid.Empty)
                throw new ArgumentException("Cliente é obrigatório.");

            if (!dto.Itens.Any())
                throw new ArgumentException("O pedido deve conter ao menos um item.");

            var codigo = await _repository.GetProximoCodigoAsync();
            var representanteId = dto.RepresentanteId ?? usuarioId;

            await ValidarFormaPagamentoAsync(dto.FormaPagamento, representanteId);

            var pedido = new PedidoVenda(
                codigo,
                dto.ClienteId,
                representanteId,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega);

            foreach (var item in dto.Itens)
                pedido.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            pedido.Atualizar(
                dto.ClienteId,
                representanteId,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento, dto.CondicaoPagamento, dto.Finalidade),
                dto.ObservacaoExterna);

            var criado = await _repository.AddAsync(pedido);

            await _log.RegistrarAsync("Criação", "PedidosVenda",
                $"Criou o Pedido de Venda #{codigo}");

            return criado;
        }

        public async Task<PedidoVenda?> GetByIdAsync(Guid id)
            => await _repository.GetByIdWithItensAsync(id);

        public async Task<IEnumerable<PedidoVenda>> GetAllAsync()
            => await _repository.GetAllWithClienteAsync();

        public async Task<bool> UpdateAsync(PedidoVendaUpdateDto dto, Guid usuarioId)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existente = await _repository.GetByIdWithItensAsync(dto.Id)
                ?? throw new KeyNotFoundException("Pedido não encontrado.");

            if (existente.Status == StatusPedido.Cancelado || existente.Status == StatusPedido.Concluido)
                throw new InvalidOperationException("Pedidos cancelados ou concluídos não podem ser editados.");

            var representanteId = dto.RepresentanteId ?? usuarioId;

            await ValidarFormaPagamentoAsync(dto.FormaPagamento, representanteId);

            existente.Atualizar(
                dto.ClienteId,
                representanteId,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento, dto.CondicaoPagamento, dto.Finalidade),
                dto.ObservacaoExterna);

            var novosItens = dto.Itens.Select(i =>
                new ItemPedido(existente.Id, i.ProdutoId, i.Quantidade, i.ValorUnitario, i.DescontoUnitario)
            ).ToList();

            var ok = await _repository.UpdateWithItensAsync(existente, novosItens);

            if (ok)
                await _log.RegistrarAsync("Edição", "PedidosVenda",
                    $"Editou o Pedido de Venda #{existente.Codigo}");

            return ok;
        }

        public async Task<bool> AlterarStatusAsync(Guid id, StatusPedido novoStatus, Guid usuarioId)
        {
            var pedido = await _repository.GetByIdWithItensAsync(id)
                ?? throw new KeyNotFoundException("Pedido não encontrado.");

            switch (novoStatus)
            {
                case StatusPedido.Confirmado:
                    if (pedido.Status != StatusPedido.Rascunho)
                        throw new InvalidOperationException("Apenas rascunhos podem ser confirmados.");
                    await ValidarSaldoEstoqueAsync(pedido);
                    pedido.Confirmar();
                    await GerarContaReceberAutomaticaAsync(pedido);
                    break;

                case StatusPedido.Concluido:
                    if (pedido.Status != StatusPedido.Confirmado)
                        throw new InvalidOperationException("Apenas pedidos confirmados podem ser concluídos.");
                    pedido.Concluir();
                    break;

                case StatusPedido.Cancelado:
                    if (pedido.Status == StatusPedido.Concluido)
                        throw new InvalidOperationException("Pedidos concluídos não podem ser cancelados.");
                    pedido.Cancelar();
                    break;

                default:
                    throw new ArgumentException("Transição de status inválida.");
            }

            var ok = await _repository.UpdateAsync(pedido);

            if (ok)
                await _log.RegistrarAsync("Status", "PedidosVenda",
                    $"Alterou status do Pedido #{pedido.Codigo} para {novoStatus}");

            return ok;
        }

        private async Task ValidarSaldoEstoqueAsync(PedidoVenda pedido)
        {
            var lotes = await _loteRepository.GetAllAsync();
            var saldoPorProduto = lotes
                .Where(l => l.Status == StatusLote.Concluido)
                .GroupBy(l => l.ProdutoId)
                .ToDictionary(g => g.Key, g => g.Count());

            foreach (var item in pedido.Itens)
            {
                var saldo = saldoPorProduto.TryGetValue(item.ProdutoId, out var qtd) ? qtd : 0;
                if (saldo < item.Quantidade)
                {
                    var produto = await _produtoRepository.GetByIdAsync(item.ProdutoId);
                    var nome = produto?.Nome ?? item.ProdutoId.ToString();
                    throw new InvalidOperationException(
                        $"Saldo de estoque insuficiente para '{nome}': disponível {saldo}, solicitado {item.Quantidade}.");
                }
            }
        }

        private async Task GerarContaReceberAutomaticaAsync(PedidoVenda pedido)
        {
            if (pedido.Total <= 0) return;
            if (await _contaReceberService.ExisteParaPedidoAsync(pedido.Id)) return;

            var nomeCondicaoSelecionada = ExtrairTag(pedido.ObservacaoInterna, "Condicao");
            var condicoes = await _condicaoPagamentoRepository.GetAllAsync();

            var condicao = (!string.IsNullOrWhiteSpace(nomeCondicaoSelecionada)
                    ? condicoes.FirstOrDefault(c => c.Ativo &&
                        c.Nome.Equals(nomeCondicaoSelecionada, StringComparison.OrdinalIgnoreCase))
                    : null)
                ?? condicoes.FirstOrDefault(c => c.Ativo && c.NumeroParcelas == 1)
                ?? throw new InvalidOperationException(
                    "Nenhuma condição de pagamento à vista (1 parcela) cadastrada. " +
                    "Cadastre uma condição de pagamento padrão antes de gerar a conta a receber automática.");

            // A data-base é a emissão do pedido: cada parcela soma seus próprios
            // NumeroDias (0, 30, 60...) já configurados na condição de pagamento.
            var dto = new ContaReceberCreateDto
            {
                Descricao           = $"Pedido de Venda #{pedido.Codigo}",
                ValorTotal          = pedido.Total,
                DataVencimento      = DateTime.UtcNow,
                PessoaId            = pedido.ClienteId,
                PedidoVendaId       = pedido.Id,
                CondicaoPagamentoId = condicao.Id,
            };

            await _contaReceberService.CreateAsync(dto);
        }

        private async Task ValidarFormaPagamentoAsync(string? formaPagamento, Guid representanteId)
        {
            if (string.IsNullOrWhiteSpace(formaPagamento)) return;

            var formas = await _formaPagamentoRepository.GetAllWithVendedoresAsync();
            var forma = formas.FirstOrDefault(f => f.Ativo &&
                f.Nome.Equals(formaPagamento, StringComparison.OrdinalIgnoreCase));

            if (forma != null && !forma.VendedorPodeUsar(representanteId))
                throw new ArgumentException(
                    $"O representante selecionado não está autorizado a usar a forma de pagamento '{forma.Nome}'.");
        }

        private static string? ExtrairTag(string? obs, string tag)
        {
            if (string.IsNullOrWhiteSpace(obs)) return null;
            var prefix = $"[{tag}: ";
            var idx = obs.IndexOf(prefix, StringComparison.Ordinal);
            if (idx < 0) return null;
            var start = idx + prefix.Length;
            var end = obs.IndexOf(']', start);
            return end > start ? obs[start..end] : null;
        }

        private static string? CombinarObservacaoInterna(string? obs, string? formaPagamento, string? condicaoPagamento, string? finalidade)
        {
            var partes = new List<string>();
            if (!string.IsNullOrWhiteSpace(formaPagamento))    partes.Add($"[Pagamento: {formaPagamento}]");
            if (!string.IsNullOrWhiteSpace(condicaoPagamento)) partes.Add($"[Condicao: {condicaoPagamento}]");
            if (!string.IsNullOrWhiteSpace(finalidade))        partes.Add($"[Finalidade: {finalidade}]");
            if (!string.IsNullOrWhiteSpace(obs))               partes.Add(obs);
            return partes.Count > 0 ? string.Join(" | ", partes) : null;
        }
    }
}
