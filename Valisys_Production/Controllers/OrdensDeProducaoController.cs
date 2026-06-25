using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/ordens-producao")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class OrdensDeProducaoController : BaseController
    {
        private readonly IOrdemDeProducaoService _service;
        private readonly IMapper _mapper;

        public OrdensDeProducaoController(IOrdemDeProducaoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.OrdensProducao.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<OrdemDeProducaoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OrdemDeProducaoReadDto>>> GetAll()
        {
            var dtos = await _service.GetAllReadDtosAsync();
            return Ok(dtos);
        }

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.OrdensProducao.Visualizar)]
        [ProducesResponseType(typeof(OrdemDeProducaoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrdemDeProducaoReadDto>> GetById(Guid id)
        {
            var ordem = await _service.GetByIdAsync(id);
            if (ordem is null) return NotFoundProblem($"Ordem '{id}' não encontrada.");
            return Ok(_mapper.Map<OrdemDeProducaoReadDto>(ordem));
        }

        [HttpGet("codigo/{codigo}")]
        [HasPermission(Permissions.OrdensProducao.Visualizar)]
        [ProducesResponseType(typeof(OrdemDeProducaoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrdemDeProducaoReadDto>> GetByCodigo(string codigo)
        {
            var decodificado = System.Net.WebUtility.UrlDecode(codigo);
            var ordem = await _service.GetByCodigoAsync(decodificado);
            if (ordem is null) return NotFoundProblem($"Ordem '{codigo}' não encontrada.");
            return Ok(_mapper.Map<OrdemDeProducaoReadDto>(ordem));
        }

        [HttpPost]
        [HasPermission(Permissions.OrdensProducao.Criar)]
        [ProducesResponseType(typeof(OrdemDeProducaoReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrdemDeProducaoReadDto>> Create([FromBody] OrdemDeProducaoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var criada = await _service.CreateAsync(dto, usuarioId);
                var readDto = _mapper.Map<OrdemDeProducaoReadDto>(criada);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return Problem(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Problem(ex.Message, StatusCodes.Status401Unauthorized); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.OrdensProducao.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrdemDeProducaoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Ordem '{id}' não encontrada.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        [HttpPost("{id:guid}/avancar-fase")]
        [HasPermission(Permissions.OrdensProducao.AvancarFase)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AvancarFase(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var ok = await _service.MovimentarProximaFaseAsync(id, usuarioId);
                if (!ok) return Problem("Não foi possível avançar a fase da ordem.");
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return Problem(ex.Message); }
        }

        [HttpPatch("{id:guid}/fase/{faseId:guid}")]
        [HasPermission(Permissions.OrdensProducao.AvancarFase)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> TrocarFase(Guid id, Guid faseId, [FromBody] TrocarFaseDto? dto = null)
        {
            try
            {
                await _service.TrocarFaseAsync(id, faseId, dto?.Justificativa);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return Problem(ex.Message); }
        }

        [HttpPost("{id:guid}/finalizar")]
        [HasPermission(Permissions.OrdensProducao.Finalizar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Finalizar(Guid id)
        {
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                await _service.FinalizarOrdemAsync(id, usuarioId);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return Problem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.OrdensProducao.Cancelar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFoundProblem($"Ordem '{id}' não encontrada.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
        }
    }
}