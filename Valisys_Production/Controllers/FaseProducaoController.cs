using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;


namespace Valisys_Production.Controllers
{
    [Route("api/fases-producao")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class FasesProducaoController : BaseController
    {
        private readonly IFaseProducaoService _service;
        private readonly IMapper _mapper;

        public FasesProducaoController(IFaseProducaoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.FasesProducao.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<FaseProducaoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FaseProducaoReadDto>>> GetAll()
            => Ok(_mapper.Map<IEnumerable<FaseProducaoReadDto>>(await _service.GetAllAsync()));

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.FasesProducao.Visualizar)]
        [ProducesResponseType(typeof(FaseProducaoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FaseProducaoReadDto>> GetById(Guid id)
        {
            var fase = await _service.GetByIdAsync(id);
            if (fase is null) return NotFoundProblem($"Fase '{id}' não encontrada.");
            return Ok(_mapper.Map<FaseProducaoReadDto>(fase));
        }

        [HttpPost]
        [HasPermission(Permissions.FasesProducao.Criar)]
        [ProducesResponseType(typeof(FaseProducaoReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FaseProducaoReadDto>> Create([FromBody] FaseProducaoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var criada = await _service.CreateAsync(dto);
                var readDto = _mapper.Map<FaseProducaoReadDto>(criada);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.FasesProducao.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] FaseProducaoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Fase '{id}' não encontrada.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.FasesProducao.Excluir)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFoundProblem($"Fase '{id}' não encontrada.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
        }
    }
}
