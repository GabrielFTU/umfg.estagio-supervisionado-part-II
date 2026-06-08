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

        public PedidoVendaService(IPedidoVendaRepository repository, ILogSistemaService log, IContaReceberService contaReceberService)
        {
            _repository = repository;
            _log = log;
            _contaReceberService = contaReceberService;
        }

        public async Task<PedidoVenda> CreateAsync(PedidoVendaCreateDto dto, Guid usuarioId)
        {
            if (dto.ClienteId == Guid.Empty)
                throw new ArgumentException("Cliente é obrigatório.");

            if (!dto.Itens.Any())
                throw new ArgumentException("O pedido deve conter ao menos um item.");

            var codigo = await _repository.GetProximoCodigoAsync();
            var representanteId = dto.RepresentanteId ?? usuarioId;

            var pedido = new PedidoVenda(
                codigo,
                dto.ClienteId,
                representanteId,
                Guid.Empty,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega);

            pedido.Atualizar(
                dto.ClienteId,
                representanteId,
                Guid.Empty,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento, dto.Finalidade),
                dto.ObservacaoExterna);

            foreach (var item in dto.Itens)
                pedido.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

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

            existente.Atualizar(
                dto.ClienteId,
                representanteId,
                Guid.Empty,
                Guid.Empty,
                Guid.Empty,
                dto.DataPrevisaoEntrega,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento, dto.Finalidade),
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

        private async Task GerarContaReceberAutomaticaAsync(PedidoVenda pedido)
        {
            if (pedido.Total <= 0) return;
            if (await _contaReceberService.ExisteParaPedidoAsync(pedido.Id)) return;

            var dto = new ContaReceberCreateDto
            {
                Descricao      = $"Pedido de Venda #{pedido.Codigo}",
                ValorTotal     = pedido.Total,
                DataVencimento = DateTime.UtcNow.AddDays(30),
                PessoaId       = pedido.ClienteId,
                PedidoVendaId  = pedido.Id,
                NumeroParcelas = 1,
            };

            await _contaReceberService.CreateAsync(dto);
        }

        private static string? CombinarObservacaoInterna(string? obs, string? formaPagamento, string? finalidade)
        {
            var partes = new List<string>();
            if (!string.IsNullOrWhiteSpace(formaPagamento)) partes.Add($"[Pagamento: {formaPagamento}]");
            if (!string.IsNullOrWhiteSpace(finalidade))     partes.Add($"[Finalidade: {finalidade}]");
            if (!string.IsNullOrWhiteSpace(obs))            partes.Add(obs);
            return partes.Count > 0 ? string.Join(" | ", partes) : null;
        }
    }
}
