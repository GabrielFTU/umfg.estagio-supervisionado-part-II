using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/formas-pagamento")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class FormaPagamentoController : BaseController
    {
        private readonly IFormaPagamentoService _service;

        public FormaPagamentoController(IFormaPagamentoService service) => _service = service;

        // ─── GET /api/formas-pagamento ────────────────────────────────────────────

        [HttpGet]
        [HasPermission(Permissions.FormasPagamento.Visualizar)]
        public async Task<ActionResult<IEnumerable<FormaPagamentoReadDto>>> GetAll()
        {
            var formas = await _service.GetAllAsync();
            return Ok(formas.Select(f => MapToRead(f)));
        }

        // ─── GET /api/formas-pagamento/{id} ───────────────────────────────────────

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.FormasPagamento.Visualizar)]
        public async Task<ActionResult<FormaPagamentoReadDto>> GetById(Guid id)
        {
            var forma = await _service.GetByIdAsync(id);
            if (forma is null) return NotFoundProblem($"Forma de pagamento '{id}' não encontrada.");
            return Ok(MapToRead(forma));
        }

        // ─── POST /api/formas-pagamento ───────────────────────────────────────────

        [HttpPost]
        [HasPermission(Permissions.FormasPagamento.Criar)]
        public async Task<ActionResult<FormaPagamentoReadDto>> Create([FromBody] FormaPagamentoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var criada = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = criada.Id }, MapToRead(criada));
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        // ─── PUT /api/formas-pagamento/{id} ───────────────────────────────────────

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.FormasPagamento.Editar)]
        public async Task<IActionResult> Update(Guid id, [FromBody] FormaPagamentoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Forma de pagamento '{id}' não encontrada.");
                return NoContent();
            }
            catch (ArgumentException ex)    { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        // ─── DELETE /api/formas-pagamento/{id} ────────────────────────────────────

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.FormasPagamento.Inativar)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFoundProblem($"Forma de pagamento '{id}' não encontrada.");
            return NoContent();
        }

        // ─── POST /api/formas-pagamento/{id}/vendedores ───────────────────────────

        [HttpPost("{id:guid}/vendedores")]
        [HasPermission(Permissions.FormasPagamento.Editar)]
        public async Task<IActionResult> AdicionarVendedor(Guid id, [FromBody] VendedorLinkDto dto)
        {
            try
            {
                var ok = await _service.AdicionarVendedorAsync(id, dto.VendedorId);
                if (!ok) return NotFoundProblem("Forma de pagamento não encontrada.");
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        // ─── DELETE /api/formas-pagamento/{id}/vendedores/{vendedorId} ────────────

        [HttpDelete("{id:guid}/vendedores/{vendedorId:guid}")]
        [HasPermission(Permissions.FormasPagamento.Editar)]
        public async Task<IActionResult> RemoverVendedor(Guid id, Guid vendedorId)
        {
            try
            {
                var ok = await _service.RemoverVendedorAsync(id, vendedorId);
                if (!ok) return NotFoundProblem("Forma de pagamento não encontrada.");
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        // ─── Mapper ───────────────────────────────────────────────────────────────

        private static FormaPagamentoReadDto MapToRead(Models.FormaPagamento f) => new()
        {
            Id                  = f.Id,
            Codigo              = f.Codigo,
            Nome                = f.Nome,
            Descricao           = f.Descricao,
            PrazoDias           = f.PrazoDias,
            Ativo               = f.Ativo,
            RestritaAVendedores = f.Vendedores.Any(),
            CriadoEm           = f.CriadoEm,
            AtualizadoEm       = f.AtualizadoEm,
            Vendedores = f.Vendedores.Select(v => new FormaPagamentoVendedorReadDto
            {
                Id           = v.Id,
                VendedorId   = v.VendedorId,
                VendedorNome = v.Vendedor?.Nome ?? "—",
            }).ToList(),
        };
    }

    public class VendedorLinkDto
    {
        public Guid VendedorId { get; set; }
    }
}
