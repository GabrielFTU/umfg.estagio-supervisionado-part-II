using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/finalidades")]
    [Authorize]
    public class FinalidadeController(IFinalidadeService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await service.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var dto = await service.GetByIdAsync(id);
            return dto is null ? NotFound() : Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FinalidadeCreateDto dto)
        {
            try
            {
                var created = await service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { detail = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FinalidadeUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest();
            try
            {
                return Ok(await service.UpdateAsync(dto));
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (InvalidOperationException ex) { return Conflict(new { detail = ex.Message }); }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try { await service.DeleteAsync(id); return NoContent(); }
            catch (KeyNotFoundException) { return NotFound(); }
        }
    }
}
