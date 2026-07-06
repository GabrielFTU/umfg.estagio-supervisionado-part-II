using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models.Enums;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/orcamentos")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class OrcamentoController : BaseController
    {
        private readonly IOrcamentoService _service;
        private readonly ApplicationDbContext _ctx;

        public OrcamentoController(IOrcamentoService service, ApplicationDbContext ctx)
        {
            _service = service;
            _ctx     = ctx;
        }

        // ─── GET /api/orcamentos ──────────────────────────────────────────────────

        [HttpGet]
        [HasPermission(Permissions.Orcamentos.Visualizar)]
        public async Task<ActionResult<PagedResultDto<OrcamentoListDto>>> GetAll([FromQuery] OrcamentoPagedQueryDto query)
        {
            var paged = await _service.GetPagedAsync(query);

            var clienteIds = paged.Items.Select(o => o.ClienteId)
                .Concat(paged.Items.Select(o => o.RepresentanteId))
                .Distinct().ToList();
            var produtoIds = paged.Items.SelectMany(o => o.Itens.Select(i => i.ProdutoId)).Distinct().ToList();

            var pessoas = await _ctx.Pessoas.AsNoTracking()
                .Where(p => clienteIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Nome);

            var produtos = await _ctx.Produtos.AsNoTracking()
                .Where(p => produtoIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Nome);

            var items = paged.Items.Select(o => new OrcamentoListDto
            {
                Id                = o.Id,
                Codigo            = o.Codigo,
                ClienteNome       = pessoas.TryGetValue(o.ClienteId, out var cn) ? cn : "—",
                RepresentanteNome = o.RepresentanteId != Guid.Empty && pessoas.TryGetValue(o.RepresentanteId, out var rn) ? rn : null,
                DataEmissao       = o.DataEmissao,
                DataValidade      = o.DataValidade,
                Total             = o.Total,
                Status            = o.Status,
                StatusLabel       = StatusLabel(o.Status),
                TotalItens        = o.Itens.Count,
                Produtos          = o.Itens.Select(i => new OrcamentoProdutoDto
                {
                    Nome       = produtos.TryGetValue(i.ProdutoId, out var pn) ? pn : "—",
                    Quantidade = i.Quantidade,
                }).ToList(),
            });

            return Ok(new PagedResultDto<OrcamentoListDto>
            {
                Items      = items,
                TotalCount = paged.TotalCount,
                Page       = paged.Page,
                PageSize   = paged.PageSize,
            });
        }

        // ─── GET /api/orcamentos/{id} ─────────────────────────────────────────────

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Orcamentos.Visualizar)]
        public async Task<ActionResult<OrcamentoReadDto>> GetById(Guid id)
        {
            var orcamento = await _service.GetByIdAsync(id);
            if (orcamento is null) return NotFoundProblem($"Orçamento '{id}' não encontrado.");

            var clientes = await _ctx.Pessoas.AsNoTracking()
                .ToDictionaryAsync(p => p.Id, p => p.Nome);
            var produtos = await _ctx.Produtos.AsNoTracking()
                .Include(p => p.UnidadeMedida)
                .ToDictionaryAsync(p => p.Id);

            var dto = new OrcamentoReadDto
            {
                Id                      = orcamento.Id,
                Codigo                  = orcamento.Codigo,
                ClienteId               = orcamento.ClienteId,
                ClienteNome             = clientes.TryGetValue(orcamento.ClienteId, out var cn) ? cn : "—",
                RepresentanteId         = orcamento.RepresentanteId,
                RepresentanteNome       = orcamento.RepresentanteId != Guid.Empty && clientes.TryGetValue(orcamento.RepresentanteId, out var rn) ? rn : null,
                Finalidade              = ExtrairTag(orcamento.ObservacaoInterna, "Finalidade"),
                FormaPagamento          = ExtrairTag(orcamento.ObservacaoInterna, "Pagamento"),
                CondicaoPagamento       = ExtrairTag(orcamento.ObservacaoInterna, "Condicao"),
                DataEmissao             = orcamento.DataEmissao,
                DataValidade            = orcamento.DataValidade,
                Desconto                = orcamento.Desconto,
                Subtotal                = orcamento.Subtotal,
                Total                   = orcamento.Total,
                ObservacaoInterna       = LimparObservacaoInterna(orcamento.ObservacaoInterna),
                ObservacaoExterna       = orcamento.ObservacaoExterna,
                Status                  = orcamento.Status,
                StatusLabel             = StatusLabel(orcamento.Status),
                PedidoVendaConvertidoId = orcamento.PedidoVendaConvertidoId,
                CriadoEm               = orcamento.CriadoEm,
                AtualizadoEm           = orcamento.AtualizadoEm,
                Itens = orcamento.Itens.Select(i =>
                {
                    produtos.TryGetValue(i.ProdutoId, out var prod);
                    return new ItemOrcamentoReadDto
                    {
                        Id               = i.Id,
                        ProdutoId        = i.ProdutoId,
                        ProdutoNome      = prod?.Nome ?? "—",
                        ProdutoCodigo    = prod != null ? prod.CodigoInternoProduto.ToString() : null,
                        UnidadeMedida    = prod?.UnidadeMedida?.Sigla,
                        Quantidade       = i.Quantidade,
                        ValorUnitario    = i.ValorUnitario,
                        DescontoUnitario = i.DescontoUnitario,
                        SubTotal         = i.SubTotal,
                    };
                }).ToList(),
            };

            return Ok(dto);
        }

        // ─── POST /api/orcamentos ─────────────────────────────────────────────────

        [HttpPost]
        [HasPermission(Permissions.Orcamentos.Criar)]
        public async Task<ActionResult<OrcamentoReadDto>> Create([FromBody] OrcamentoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var criado    = await _service.CreateAsync(dto, usuarioId);
                return CreatedAtAction(nameof(GetById), new { id = criado.Id }, new { id = criado.Id, codigo = criado.Codigo });
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (InvalidOperationException ex)  { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)       { return NotFoundProblem(ex.Message); }
            catch (DbUpdateException ex)          { return ConflictProblem(ex.InnerException?.Message ?? ex.Message); }
        }

        // ─── PUT /api/orcamentos/{id} ─────────────────────────────────────────────

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Orcamentos.Editar)]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrcamentoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok        = await _service.UpdateAsync(dto, usuarioId);
                if (!ok) return NotFoundProblem($"Orçamento '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (InvalidOperationException ex)  { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)       { return NotFoundProblem(ex.Message); }
            catch (DbUpdateException ex)          { return ConflictProblem(ex.InnerException?.Message ?? ex.Message); }
        }

        // ─── PATCH /api/orcamentos/{id}/enviar ───────────────────────────────────

        [HttpPatch("{id:guid}/enviar")]
        [HasPermission(Permissions.Orcamentos.Enviar)]
        public async Task<IActionResult> Enviar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok        = await _service.AlterarStatusAsync(id, StatusOrcamento.Enviado, usuarioId);
                if (!ok) return NotFoundProblem($"Orçamento '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex)         { return Problem(ex.Message); }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)      { return NotFoundProblem(ex.Message); }
        }

        // ─── PATCH /api/orcamentos/{id}/aprovar ──────────────────────────────────

        [HttpPatch("{id:guid}/aprovar")]
        [HasPermission(Permissions.Orcamentos.Aprovar)]
        public async Task<IActionResult> Aprovar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok        = await _service.AlterarStatusAsync(id, StatusOrcamento.Aprovado, usuarioId);
                if (!ok) return NotFoundProblem($"Orçamento '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex)         { return Problem(ex.Message); }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)      { return NotFoundProblem(ex.Message); }
        }

        // ─── PATCH /api/orcamentos/{id}/cancelar ─────────────────────────────────

        [HttpPatch("{id:guid}/cancelar")]
        [HasPermission(Permissions.Orcamentos.Cancelar)]
        public async Task<IActionResult> Cancelar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok        = await _service.AlterarStatusAsync(id, StatusOrcamento.Cancelado, usuarioId);
                if (!ok) return NotFoundProblem($"Orçamento '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex)         { return Problem(ex.Message); }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)      { return NotFoundProblem(ex.Message); }
        }

        // ─── POST /api/orcamentos/{id}/converter-em-pedido ───────────────────────

        [HttpPost("{id:guid}/converter-em-pedido")]
        [HasPermission(Permissions.Orcamentos.ConverterEmPedido)]
        public async Task<ActionResult<ConverterEmPedidoResultDto>> ConverterEmPedido(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var result    = await _service.ConverterEmPedidoAsync(id, usuarioId);
                return Ok(result);
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (InvalidOperationException ex)  { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)       { return NotFoundProblem(ex.Message); }
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private static string StatusLabel(StatusOrcamento status) => status switch
        {
            StatusOrcamento.Rascunho           => "Rascunho",
            StatusOrcamento.Enviado            => "Enviado",
            StatusOrcamento.Aprovado           => "Aprovado",
            StatusOrcamento.Expirado           => "Expirado",
            StatusOrcamento.Cancelado          => "Cancelado",
            StatusOrcamento.ConvertidoEmPedido => "Convertido",
            _                                  => status.ToString()
        };

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
