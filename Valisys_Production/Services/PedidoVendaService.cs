using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
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
        private readonly IProdutoRepository _produtoRepository;
        private readonly IMovimentacaoRepository _movimentacaoRepository;
        private readonly IAlmoxarifadoRepository _almoxarifadoRepository;
        private readonly ApplicationDbContext _context;

        public PedidoVendaService(IPedidoVendaRepository repository, ILogSistemaService log,
            IContaReceberService contaReceberService, ICondicaoPagamentoRepository condicaoPagamentoRepository,
            IFormaPagamentoRepository formaPagamentoRepository,
            IProdutoRepository produtoRepository, IMovimentacaoRepository movimentacaoRepository,
            IAlmoxarifadoRepository almoxarifadoRepository, ApplicationDbContext context)
        {
            _repository = repository;
            _log = log;
            _contaReceberService = contaReceberService;
            _condicaoPagamentoRepository = condicaoPagamentoRepository;
            _formaPagamentoRepository = formaPagamentoRepository;
            _produtoRepository = produtoRepository;
            _movimentacaoRepository = movimentacaoRepository;
            _almoxarifadoRepository = almoxarifadoRepository;
            _context = context;
        }

        public async Task<PedidoVenda> CreateAsync(PedidoVendaCreateDto dto, Guid usuarioId)
        {
            if (dto.ClienteId == Guid.Empty)
                throw new ArgumentException("Cliente é obrigatório.");

            if (!dto.Itens.Any())
                throw new ArgumentException("O pedido deve conter ao menos um item.");

            var codigo = await _repository.GetProximoCodigoAsync();

            await ValidarFormaPagamentoAsync(dto.FormaPagamento, dto.RepresentanteId);

            var pedido = new PedidoVenda(
                codigo,
                dto.ClienteId,
                dto.RepresentanteId,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega);

            foreach (var item in dto.Itens)
                pedido.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            pedido.Atualizar(
                dto.ClienteId,
                dto.RepresentanteId,
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

            await ValidarFormaPagamentoAsync(dto.FormaPagamento, dto.RepresentanteId);

            existente.Atualizar(
                dto.ClienteId,
                dto.RepresentanteId,
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

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                switch (novoStatus)
                {
                    case StatusPedido.Confirmado:
                        if (pedido.Status != StatusPedido.Rascunho)
                            throw new InvalidOperationException("Apenas rascunhos podem ser confirmados.");
                        await ValidarSaldoEstoqueAsync(pedido);
                        pedido.Confirmar();
                        await BaixarEstoqueAsync(pedido, usuarioId);
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
                await transaction.CommitAsync();

                if (ok)
                    await _log.RegistrarAsync("Status", "PedidosVenda",
                        $"Alterou status do Pedido #{pedido.Codigo} para {novoStatus}");

                return ok;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<Almoxarifado> GetAlmoxarifadoPrincipalAsync()
        {
            var almoxarifados = await _almoxarifadoRepository.GetAllAsync();
            return almoxarifados.FirstOrDefault() ?? throw new InvalidOperationException("Nenhum almoxarifado cadastrado.");
        }

        private async Task<Dictionary<Guid, decimal>> ObterSaldosPorProdutoAsync(IEnumerable<Guid> produtoIds)
        {
            var ids = produtoIds.Distinct().ToList();
            var movs = await _context.Movimentacoes.AsNoTracking()
                .Where(m => ids.Contains(m.ProdutoId))
                .ToListAsync();

            return ids.ToDictionary(pid => pid, pid =>
            {
                var movsP = movs.Where(m => m.ProdutoId == pid);
                var entrada = movsP.Where(m => m.Tipo == TipoMovimentacao.Entrada).Sum(m => m.Quantidade);
                var saida = movsP.Where(m => m.Tipo == TipoMovimentacao.Saida || m.Tipo == TipoMovimentacao.Baixa).Sum(m => m.Quantidade);
                return entrada - saida;
            });
        }

        private async Task ValidarSaldoEstoqueAsync(PedidoVenda pedido)
        {
            var saldos = await ObterSaldosPorProdutoAsync(pedido.Itens.Select(i => i.ProdutoId));

            foreach (var item in pedido.Itens)
            {
                var saldo = saldos.TryGetValue(item.ProdutoId, out var qtd) ? qtd : 0;
                if (saldo < item.Quantidade)
                {
                    var produto = await _produtoRepository.GetByIdAsync(item.ProdutoId);
                    var nome = produto?.Nome ?? item.ProdutoId.ToString();
                    throw new InvalidOperationException(
                        $"Saldo de estoque insuficiente para '{nome}': disponível {saldo}, solicitado {item.Quantidade}.");
                }
            }
        }

        private async Task BaixarEstoqueAsync(PedidoVenda pedido, Guid usuarioId)
        {
            var almoxarifado = await GetAlmoxarifadoPrincipalAsync();

            foreach (var item in pedido.Itens)
            {
                var mov = new Movimentacao(
                    item.ProdutoId, item.Quantidade,
                    $"Baixa por Pedido de Venda #{pedido.Codigo}",
                    almoxarifado.Id, null,
                    null, null,
                    usuarioId,
                    pedidoVendaId: pedido.Id);
                await _movimentacaoRepository.AddAsync(mov);
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
