using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/lotes")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class LotesController : BaseController
    {
        private readonly ILoteService _service;
        private readonly IMapper _mapper;

        public LotesController(ILoteService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Lotes.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<LoteReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<LoteReadDto>>> GetAll()
            => Ok(_mapper.Map<IEnumerable<LoteReadDto>>(await _service.GetAllAsync()));

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Lotes.Visualizar)]
        [ProducesResponseType(typeof(LoteReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LoteReadDto>> GetById(Guid id)
        {
            var lote = await _service.GetByIdAsync(id);
            if (lote is null) return NotFoundProblem($"Lote '{id}' não encontrado.");
            return Ok(_mapper.Map<LoteReadDto>(lote));
        }

        [HttpPost]
        [HasPermission(Permissions.Lotes.Criar)]
        [ProducesResponseType(typeof(LoteReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoteReadDto>> Create([FromBody] LoteCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var criado = await _service.CreateAsync(dto);
                var readDto = _mapper.Map<LoteReadDto>(criado);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Lotes.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] LoteUpdateDto dto)
        {
            if (!id.Equals(dto.Id)) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Lote '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Lotes.Cancelar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFoundProblem($"Lote '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
        }
    }
}
