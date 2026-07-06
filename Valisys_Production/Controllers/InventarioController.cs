using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/inventarios")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class InventarioController : BaseController
    {
        private readonly IInventarioService _service;
        private readonly IMapper _mapper;

        public InventarioController(IInventarioService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Inventarios.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<InventarioReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<InventarioReadDto>>> GetAll()
            => Ok(_mapper.Map<IEnumerable<InventarioReadDto>>(await _service.GetAllAsync()));

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Inventarios.Visualizar)]
        [ProducesResponseType(typeof(InventarioReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InventarioReadDto>> GetById(Guid id)
        {
            var inventario = await _service.GetByIdAsync(id);
            if (inventario is null) return NotFoundProblem($"Inventário '{id}' não encontrado.");
            return Ok(_mapper.Map<InventarioReadDto>(inventario));
        }

        [HttpPost]
        [HasPermission(Permissions.Inventarios.Criar)]
        [ProducesResponseType(typeof(InventarioReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InventarioReadDto>> Create([FromBody] InventarioCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var criado = await _service.CreateAsync(dto, usuarioId);
                var readDto = _mapper.Map<InventarioReadDto>(await _service.GetByIdAsync(criado.Id));
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Problem(ex.Message, StatusCodes.Status401Unauthorized); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Inventarios.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update(Guid id, [FromBody] InventarioUpdateDto dto)
        {
            if (!id.Equals(dto.Id)) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Inventário '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (KeyNotFoundException ex)       { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex)  { return ConflictProblem(ex.Message); }
        }

        [HttpPatch("{id:guid}/finalizar")]
        [HasPermission(Permissions.Inventarios.Finalizar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Finalizar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok = await _service.FinalizarAsync(id, usuarioId);
                if (!ok) return NotFoundProblem($"Inventário '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Inventarios.Cancelar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.CancelarAsync(id);
                if (!ok) return NotFoundProblem($"Inventário '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
        }
    }
}
