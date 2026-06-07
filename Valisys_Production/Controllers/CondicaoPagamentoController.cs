using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/condicoes-pagamento")]
    [Authorize]
    public class CondicaoPagamentoController(ICondicaoPagamentoService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await service.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await service.GetByIdAsync(id);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CondicaoPagamentoCreateDto dto)
        {
            try
            {
                var result = await service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { detail = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CondicaoPagamentoUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest(new { detail = "Id divergente." });
            try
            {
                var result = await service.UpdateAsync(dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { detail = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { detail = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await service.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { detail = ex.Message });
            }
        }
    }
}
