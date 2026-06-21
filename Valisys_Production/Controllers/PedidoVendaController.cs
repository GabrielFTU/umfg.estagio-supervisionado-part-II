using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models.Enums;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/pedidos-venda")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class PedidoVendaController : BaseController
    {
        private readonly IPedidoVendaService _service;
        private readonly ApplicationDbContext _ctx;

        public PedidoVendaController(IPedidoVendaService service, ApplicationDbContext ctx)
        {
            _service = service;
            _ctx = ctx;
        }

        // ─── GET /api/pedidos-venda ───────────────────────────────────────────────

        [HttpGet]
        [HasPermission(Permissions.PedidosVenda.Visualizar)]
        public async Task<ActionResult<IEnumerable<PedidoVendaListDto>>> GetAll()
        {
            var pedidos = await _service.GetAllAsync();

            var clientes = await _ctx.Pessoas
                .AsNoTracking()
                .ToDictionaryAsync(p => p.Id, p => p.Nome);

            var usuarios = await _ctx.Usuarios
                .AsNoTracking()
                .ToDictionaryAsync(u => u.Id, u => u.Nome);

            var result = pedidos.Select(p => new PedidoVendaListDto
            {
                Id                 = p.Id,
                Codigo             = p.Codigo,
                ClienteNome        = clientes.TryGetValue(p.ClienteId, out var cn) ? cn : "—",
                RepresentanteNome  = p.RepresentanteId != Guid.Empty && usuarios.TryGetValue(p.RepresentanteId, out var rn) ? rn : null,
                DataEmissao        = p.DataEmissao,
                DataPrevisaoEntrega = p.DataPrevisaoEntrega,
                Total              = p.Total,
                Status             = p.Status,
                StatusLabel        = StatusLabel(p.Status),
                TotalItens         = p.Itens.Count,
            });

            return Ok(result);
        }

        // ─── GET /api/pedidos-venda/{id} ─────────────────────────────────────────

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.PedidosVenda.Visualizar)]
        public async Task<ActionResult<PedidoVendaReadDto>> GetById(Guid id)
        {
            var pedido = await _service.GetByIdAsync(id);
            if (pedido is null) return NotFoundProblem($"Pedido '{id}' não encontrado.");

            var clientes = await _ctx.Pessoas.AsNoTracking()
                .ToDictionaryAsync(p => p.Id, p => p.Nome);
            var usuarios = await _ctx.Usuarios.AsNoTracking()
                .ToDictionaryAsync(u => u.Id, u => u.Nome);
            var produtos = await _ctx.Produtos.AsNoTracking()
                .Include(p => p.UnidadeMedida)
                .ToDictionaryAsync(p => p.Id);

            var dto = new PedidoVendaReadDto
            {
                Id                  = pedido.Id,
                Codigo              = pedido.Codigo,
                ClienteId           = pedido.ClienteId,
                ClienteNome         = clientes.TryGetValue(pedido.ClienteId, out var cn) ? cn : "—",
                RepresentanteId     = pedido.RepresentanteId,
                RepresentanteNome   = pedido.RepresentanteId != Guid.Empty && usuarios.TryGetValue(pedido.RepresentanteId, out var rn) ? rn : null,
                FormaPagamento      = ExtrairTag(pedido.ObservacaoInterna, "Pagamento"),
                CondicaoPagamento   = ExtrairTag(pedido.ObservacaoInterna, "Condicao"),
                Finalidade          = ExtrairTag(pedido.ObservacaoInterna, "Finalidade"),
                DataEmissao         = pedido.DataEmissao,
                DataPrevisaoEntrega = pedido.DataPrevisaoEntrega,
                Desconto            = pedido.Desconto,
                Subtotal            = pedido.Subtotal,
                Total               = pedido.Total,
                ObservacaoInterna   = LimparObservacaoInterna(pedido.ObservacaoInterna),
                ObservacaoExterna   = pedido.ObservacaoExterna,
                Status              = pedido.Status,
                StatusLabel         = StatusLabel(pedido.Status),
                CriadoEm           = pedido.CriadoEm,
                AtualizadoEm       = pedido.AtualizadoEm,
                Itens = pedido.Itens.Select(i =>
                {
                    produtos.TryGetValue(i.ProdutoId, out var prod);
                    return new ItemPedidoReadDto
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

        // ─── POST /api/pedidos-venda ──────────────────────────────────────────────

        [HttpPost]
        [HasPermission(Permissions.PedidosVenda.Criar)]
        public async Task<ActionResult<PedidoVendaReadDto>> Create([FromBody] PedidoVendaCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var criado = await _service.CreateAsync(dto, usuarioId);
                return CreatedAtAction(nameof(GetById), new { id = criado.Id }, new { id = criado.Id, codigo = criado.Codigo });
            }
            catch (ArgumentException ex)           { return Problem(ex.Message); }
            catch (InvalidOperationException ex)   { return ConflictProblem(ex.Message); }
        }

        // ─── PUT /api/pedidos-venda/{id} ──────────────────────────────────────────

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.PedidosVenda.Editar)]
        public async Task<IActionResult> Update(Guid id, [FromBody] PedidoVendaUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok = await _service.UpdateAsync(dto, usuarioId);
                if (!ok) return NotFoundProblem($"Pedido '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (InvalidOperationException ex)  { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)       { return NotFoundProblem(ex.Message); }
        }

        // ─── PATCH /api/pedidos-venda/{id}/confirmar ──────────────────────────────

        [HttpPatch("{id:guid}/confirmar")]
        [HasPermission(Permissions.PedidosVenda.Confirmar)]
        public async Task<IActionResult> Confirmar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok = await _service.AlterarStatusAsync(id, StatusPedido.Confirmado, usuarioId);
                if (!ok) return NotFoundProblem($"Pedido '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)      { return NotFoundProblem(ex.Message); }
        }

        // ─── PATCH /api/pedidos-venda/{id}/concluir ───────────────────────────────

        [HttpPatch("{id:guid}/concluir")]
        [HasPermission(Permissions.PedidosVenda.Concluir)]
        public async Task<IActionResult> Concluir(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok = await _service.AlterarStatusAsync(id, StatusPedido.Concluido, usuarioId);
                if (!ok) return NotFoundProblem($"Pedido '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)      { return NotFoundProblem(ex.Message); }
        }

        // ─── PATCH /api/pedidos-venda/{id}/cancelar ───────────────────────────────

        [HttpPatch("{id:guid}/cancelar")]
        [HasPermission(Permissions.PedidosVenda.Cancelar)]
        public async Task<IActionResult> Cancelar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok = await _service.AlterarStatusAsync(id, StatusPedido.Cancelado, usuarioId);
                if (!ok) return NotFoundProblem($"Pedido '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (KeyNotFoundException ex)      { return NotFoundProblem(ex.Message); }
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private static string StatusLabel(StatusPedido status) => status switch
        {
            StatusPedido.Rascunho   => "Rascunho",
            StatusPedido.Confirmado => "Confirmado",
            StatusPedido.Concluido  => "Concluído",
            StatusPedido.Cancelado  => "Cancelado",
            _                       => status.ToString()
        };

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

        private static string? LimparObservacaoInterna(string? obs)
        {
            if (string.IsNullOrWhiteSpace(obs)) return null;
            var partes = obs.Split(" | ", StringSplitOptions.RemoveEmptyEntries);
            var filtradas = partes.Where(p => !p.StartsWith('[') || !p.EndsWith(']'));
            var resultado = string.Join(" | ", filtradas).Trim();
            return string.IsNullOrWhiteSpace(resultado) ? null : resultado;
        }
    }
}
