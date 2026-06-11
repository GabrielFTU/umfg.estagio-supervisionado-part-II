using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class OrcamentoService : IOrcamentoService
    {
        private readonly IOrcamentoRepository _repository;
        private readonly ILogSistemaService _log;
        private readonly IPedidoVendaService _pedidoVendaService;

        public OrcamentoService(IOrcamentoRepository repository, ILogSistemaService log,
                                IPedidoVendaService pedidoVendaService)
        {
            _repository          = repository;
            _log                 = log;
            _pedidoVendaService  = pedidoVendaService;
        }

        public async Task<Orcamento> CreateAsync(OrcamentoCreateDto dto, Guid usuarioId)
        {
            if (dto.ClienteId == Guid.Empty)
                throw new ArgumentException("Cliente é obrigatório.");

            if (!dto.Itens.Any())
                throw new ArgumentException("O orçamento deve conter ao menos um item.");

            var codigo           = await _repository.GetProximoCodigoAsync();
            var representanteId  = dto.RepresentanteId ?? usuarioId;

            var orcamento = new Orcamento(codigo, dto.ClienteId, representanteId, dto.DataValidade);

            orcamento.Atualizar(
                dto.ClienteId,
                representanteId,
                dto.DataValidade,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento),
                dto.ObservacaoExterna);

            foreach (var item in dto.Itens)
                orcamento.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            var criado = await _repository.AddAsync(orcamento);

            await _log.RegistrarAsync("Criação", "Orcamentos",
                $"Criou o Orçamento #{codigo}");

            return criado;
        }

        public async Task<Orcamento?> GetByIdAsync(Guid id)
            => await _repository.GetByIdWithItensAsync(id);

        public async Task<IEnumerable<Orcamento>> GetAllAsync()
            => await _repository.GetAllWithClienteAsync();

        public async Task<bool> UpdateAsync(OrcamentoUpdateDto dto, Guid usuarioId)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existente = await _repository.GetByIdWithItensAsync(dto.Id)
                ?? throw new KeyNotFoundException("Orçamento não encontrado.");

            if (existente.Status == StatusOrcamento.Cancelado || existente.Status == StatusOrcamento.ConvertidoEmPedido)
                throw new InvalidOperationException("Orçamentos cancelados ou convertidos não podem ser editados.");

            var representanteId = dto.RepresentanteId ?? usuarioId;

            existente.Atualizar(
                dto.ClienteId,
                representanteId,
                dto.DataValidade,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento),
                dto.ObservacaoExterna);

            var novosItens = dto.Itens.Select(i =>
                new ItemOrcamento(existente.Id, i.ProdutoId, i.Quantidade, i.ValorUnitario, i.DescontoUnitario)
            ).ToList();

            var ok = await _repository.UpdateWithItensAsync(existente, novosItens);

            if (ok)
                await _log.RegistrarAsync("Edição", "Orcamentos",
                    $"Editou o Orçamento #{existente.Codigo}");

            return ok;
        }

        public async Task<bool> AlterarStatusAsync(Guid id, StatusOrcamento novoStatus, Guid usuarioId)
        {
            var orcamento = await _repository.GetByIdWithItensAsync(id)
                ?? throw new KeyNotFoundException("Orçamento não encontrado.");

            switch (novoStatus)
            {
                case StatusOrcamento.Enviado:
                    orcamento.Enviar();
                    break;

                case StatusOrcamento.Aprovado:
                    orcamento.Aprovar();
                    break;

                case StatusOrcamento.Expirado:
                    orcamento.Expirar();
                    break;

                case StatusOrcamento.Cancelado:
                    orcamento.Cancelar();
                    break;

                default:
                    throw new ArgumentException("Transição de status inválida.");
            }

            var ok = await _repository.UpdateAsync(orcamento);

            if (ok)
                await _log.RegistrarAsync("Status", "Orcamentos",
                    $"Alterou status do Orçamento #{orcamento.Codigo} para {novoStatus}");

            return ok;
        }

        public async Task<ConverterEmPedidoResultDto> ConverterEmPedidoAsync(Guid id, Guid usuarioId)
        {
            var orcamento = await _repository.GetByIdWithItensAsync(id)
                ?? throw new KeyNotFoundException("Orçamento não encontrado.");

            if (orcamento.Status == StatusOrcamento.Cancelado)
                throw new InvalidOperationException("Orçamentos cancelados não podem ser convertidos em pedido.");

            if (orcamento.Status == StatusOrcamento.ConvertidoEmPedido)
                throw new InvalidOperationException("Este orçamento já foi convertido em pedido.");

            if (!orcamento.Itens.Any())
                throw new InvalidOperationException("O orçamento não possui itens para conversão.");

            var pedidoDto = new PedidoVendaCreateDto
            {
                ClienteId          = orcamento.ClienteId,
                RepresentanteId    = orcamento.RepresentanteId,
                FormaPagamento     = ExtrairTag(orcamento.ObservacaoInterna, "Pagamento"),
                DataPrevisaoEntrega = null,
                Desconto           = orcamento.Desconto,
                ObservacaoInterna  = LimparObservacaoInterna(orcamento.ObservacaoInterna),
                ObservacaoExterna  = orcamento.ObservacaoExterna,
                Itens = orcamento.Itens.Select(i => new ItemPedidoCreateDto
                {
                    ProdutoId        = i.ProdutoId,
                    Quantidade       = i.Quantidade,
                    ValorUnitario    = i.ValorUnitario,
                    DescontoUnitario = i.DescontoUnitario,
                }).ToList(),
            };

            var pedido = await _pedidoVendaService.CreateAsync(pedidoDto, usuarioId);

            orcamento.MarcarComoConvertido(pedido.Id);
            await _repository.UpdateAsync(orcamento);

            await _log.RegistrarAsync("Conversão", "Orcamentos",
                $"Converteu o Orçamento #{orcamento.Codigo} no Pedido de Venda #{pedido.Codigo}");

            return new ConverterEmPedidoResultDto
            {
                PedidoVendaId     = pedido.Id,
                PedidoVendaCodigo = pedido.Codigo,
            };
        }

        private static string? CombinarObservacaoInterna(string? obs, string? formaPagamento)
        {
            var partes = new List<string>();
            if (!string.IsNullOrWhiteSpace(formaPagamento)) partes.Add($"[Pagamento: {formaPagamento}]");
            if (!string.IsNullOrWhiteSpace(obs))            partes.Add(obs);
            return partes.Count > 0 ? string.Join(" | ", partes) : null;
        }

        private static string? ExtrairTag(string? obs, string tag)
        {
            if (string.IsNullOrWhiteSpace(obs)) return null;
            var prefix = $"[{tag}: ";
            var idx    = obs.IndexOf(prefix, StringComparison.Ordinal);
            if (idx < 0) return null;
            var start  = idx + prefix.Length;
            var end    = obs.IndexOf(']', start);
            return end > start ? obs[start..end] : null;
        }

        private static string? LimparObservacaoInterna(string? obs)
        {
            if (string.IsNullOrWhiteSpace(obs)) return null;
            var partes    = obs.Split(" | ", StringSplitOptions.RemoveEmptyEntries);
            var filtradas = partes.Where(p => !p.StartsWith('[') || !p.EndsWith(']'));
            var resultado = string.Join(" | ", filtradas).Trim();
            return string.IsNullOrWhiteSpace(resultado) ? null : resultado;
        }
    }
}
