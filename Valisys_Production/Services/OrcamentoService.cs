using Valisys_Production.Data;
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
        private readonly ApplicationDbContext _context;

        public OrcamentoService(IOrcamentoRepository repository, ILogSistemaService log,
                                IPedidoVendaService pedidoVendaService, ApplicationDbContext context)
        {
            _repository         = repository;
            _log                = log;
            _pedidoVendaService = pedidoVendaService;
            _context            = context;
        }

        public async Task<Orcamento> CreateAsync(OrcamentoCreateDto dto, Guid usuarioId)
        {
            if (dto.ClienteId == Guid.Empty)
                throw new ArgumentException("Cliente é obrigatório.");

            if (!dto.Itens.Any())
                throw new ArgumentException("O orçamento deve conter ao menos um item.");

            ValidarDesconto(dto.Desconto, dto.Itens.Select(i => (i.ValorUnitario, i.DescontoUnitario, i.Quantidade)));
            ValidarDataValidade(dto.DataValidade);

            var codigo = await _repository.GetProximoCodigoAsync();

            var orcamento = new Orcamento(codigo, dto.ClienteId, dto.RepresentanteId, dto.DataValidade);

            orcamento.Atualizar(
                dto.ClienteId,
                dto.RepresentanteId,
                dto.DataValidade,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento, dto.CondicaoPagamento, dto.Finalidade),
                dto.ObservacaoExterna);

            foreach (var item in dto.Itens)
                orcamento.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            var criado = await _repository.AddAsync(orcamento);

            await _log.RegistrarAsync("Criação", "Orcamentos", $"Criou o Orçamento #{codigo}");

            return criado;
        }

        public async Task<Orcamento?> GetByIdAsync(Guid id)
            => await _repository.GetByIdWithItensAsync(id);

        public async Task<PagedResultDto<Orcamento>> GetPagedAsync(OrcamentoPagedQueryDto query)
        {
            var (items, total) = await _repository.GetPagedAsync(query);
            return new PagedResultDto<Orcamento>
            {
                Items      = items,
                TotalCount = total,
                Page       = Math.Max(1, query.Page),
                PageSize   = Math.Clamp(query.PageSize, 1, 100),
            };
        }

        public async Task<bool> UpdateAsync(OrcamentoUpdateDto dto, Guid usuarioId)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existente = await _repository.GetByIdWithItensAsync(dto.Id)
                ?? throw new KeyNotFoundException("Orçamento não encontrado.");

            if (existente.Status == StatusOrcamento.Cancelado || existente.Status == StatusOrcamento.ConvertidoEmPedido)
                throw new InvalidOperationException("Orçamentos cancelados ou convertidos não podem ser editados.");

            ValidarDesconto(dto.Desconto, dto.Itens.Select(i => (i.ValorUnitario, i.DescontoUnitario, i.Quantidade)));
            ValidarDataValidade(dto.DataValidade);

            existente.Atualizar(
                dto.ClienteId,
                dto.RepresentanteId,
                dto.DataValidade,
                dto.Desconto,
                CombinarObservacaoInterna(dto.ObservacaoInterna, dto.FormaPagamento, dto.CondicaoPagamento, dto.Finalidade),
                dto.ObservacaoExterna);

            var novosItens = dto.Itens.Select(i =>
                new ItemOrcamento(existente.Id, i.ProdutoId, i.Quantidade, i.ValorUnitario, i.DescontoUnitario)
            ).ToList();

            var ok = await _repository.UpdateWithItensAsync(existente, novosItens);

            if (ok)
                await _log.RegistrarAsync("Edição", "Orcamentos", $"Editou o Orçamento #{existente.Codigo}");

            return ok;
        }

        public async Task<bool> AlterarStatusAsync(Guid id, StatusOrcamento novoStatus, Guid usuarioId)
        {
            var orcamento = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Orçamento não encontrado.");

            switch (novoStatus)
            {
                case StatusOrcamento.Enviado:    orcamento.Enviar();   break;
                case StatusOrcamento.Aprovado:   orcamento.Aprovar();  break;
                case StatusOrcamento.Expirado:   orcamento.Expirar();  break;
                case StatusOrcamento.Cancelado:  orcamento.Cancelar(); break;
                default: throw new ArgumentException("Transição de status inválida.");
            }

            var ok = await _repository.AtualizarStatusAsync(id, novoStatus);

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

            var descontoConvertido = Math.Min(orcamento.Desconto, orcamento.Subtotal);

            var pedidoDto = new PedidoVendaCreateDto
            {
                ClienteId           = orcamento.ClienteId,
                RepresentanteId     = orcamento.RepresentanteId,
                FormaPagamento      = ExtrairTag(orcamento.ObservacaoInterna, "Pagamento"),
                CondicaoPagamento   = ExtrairTag(orcamento.ObservacaoInterna, "Condicao"),
                Finalidade          = ExtrairTag(orcamento.ObservacaoInterna, "Finalidade"),
                DataPrevisaoEntrega = null,
                Desconto            = descontoConvertido,
                ObservacaoInterna   = LimparObservacaoInterna(orcamento.ObservacaoInterna),
                ObservacaoExterna   = orcamento.ObservacaoExterna,
                Itens = orcamento.Itens.Select(i => new ItemPedidoCreateDto
                {
                    ProdutoId        = i.ProdutoId,
                    Quantidade       = i.Quantidade,
                    ValorUnitario    = i.ValorUnitario,
                    DescontoUnitario = i.DescontoUnitario,
                }).ToList(),
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pedido = await _pedidoVendaService.CreateAsync(pedidoDto, usuarioId);

                await _repository.AtualizarStatusAsync(orcamento.Id, StatusOrcamento.ConvertidoEmPedido, pedido.Id);

                await transaction.CommitAsync();

                await _log.RegistrarAsync("Conversão", "Orcamentos",
                    $"Converteu o Orçamento #{orcamento.Codigo} no Pedido de Venda #{pedido.Codigo}");

                return new ConverterEmPedidoResultDto
                {
                    PedidoVendaId     = pedido.Id,
                    PedidoVendaCodigo = pedido.Codigo,
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static string? CombinarObservacaoInterna(string? obs, string? formaPagamento, string? condicaoPagamento, string? finalidade)
        {
            var partes = new List<string>();
            if (!string.IsNullOrWhiteSpace(finalidade))        partes.Add($"[Finalidade: {finalidade}]");
            if (!string.IsNullOrWhiteSpace(formaPagamento))    partes.Add($"[Pagamento: {formaPagamento}]");
            if (!string.IsNullOrWhiteSpace(condicaoPagamento)) partes.Add($"[Condicao: {condicaoPagamento}]");
            if (!string.IsNullOrWhiteSpace(obs))               partes.Add(obs);
            return partes.Count > 0 ? string.Join(" | ", partes) : null;
        }

        private static void ValidarDesconto(decimal desconto, IEnumerable<(decimal ValorUnitario, decimal DescontoUnitario, int Quantidade)> itens)
        {
            var subtotal = itens.Sum(i => (i.ValorUnitario - i.DescontoUnitario) * i.Quantidade);
            if (desconto > subtotal)
                throw new ArgumentException("O desconto não pode ser maior que o subtotal.");
        }

        private static void ValidarDataValidade(DateTime? dataValidade)
        {
            if (dataValidade.HasValue && dataValidade.Value.Date < DateTime.UtcNow.Date)
                throw new ArgumentException("A data de validade não pode estar no passado.");
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
