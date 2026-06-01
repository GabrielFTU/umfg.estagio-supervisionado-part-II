using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/fichas-tecnicas")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class FichasTecnicasController : BaseController
    {
        private readonly IFichaTecnicaService _service;
        private readonly IMapper _mapper;

        public FichasTecnicasController(IFichaTecnicaService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.FichasTecnicas.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<FichaTecnicaReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FichaTecnicaReadDto>>> GetAll()
            => Ok(_mapper.Map<IEnumerable<FichaTecnicaReadDto>>(await _service.GetAllAsync()));

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.FichasTecnicas.Visualizar)]
        [ProducesResponseType(typeof(FichaTecnicaReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FichaTecnicaReadDto>> GetById(Guid id)
        {
            var ficha = await _service.GetByIdAsync(id);
            if (ficha is null) return NotFoundProblem($"Ficha técnica '{id}' não encontrada.");
            return Ok(_mapper.Map<FichaTecnicaReadDto>(ficha));
        }

        [HttpGet("proximo-codigo")]
        [HasPermission(Permissions.FichasTecnicas.Criar)]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> GetProximoCodigo()
            => Ok(new { codigo = await _service.ObterProximoCodigoAsync() });

        [HttpPost]
        [HasPermission(Permissions.FichasTecnicas.Criar)]
        [ProducesResponseType(typeof(FichaTecnicaReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FichaTecnicaReadDto>> Create([FromBody] FichaTecnicaCreateDto dto)
        {
            try
            {
                var criada = await _service.CreateAsync(dto);
                var readDto = _mapper.Map<FichaTecnicaReadDto>(criada);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.FichasTecnicas.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] FichaTecnicaUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Ficha técnica '{id}' não encontrada.");
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return Problem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.FichasTecnicas.Inativar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFoundProblem($"Ficha técnica '{id}' não encontrada.");
            return NoContent();
        }
    }
}