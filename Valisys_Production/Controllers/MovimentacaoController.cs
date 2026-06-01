using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/movimentacoes")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class MovimentacoesController : BaseController
    {
        private readonly IMovimentacaoService _service;
        private readonly IMapper _mapper;

        public MovimentacoesController(IMovimentacaoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Movimentacoes.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<MovimentacaoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<MovimentacaoReadDto>>> GetAll()
            => Ok(_mapper.Map<IEnumerable<MovimentacaoReadDto>>(await _service.GetAllAsync()));

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Movimentacoes.Visualizar)]
        [ProducesResponseType(typeof(MovimentacaoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovimentacaoReadDto>> GetById(Guid id)
        {
            var mov = await _service.GetByIdAsync(id);
            if (mov is null) return NotFoundProblem($"Movimentação '{id}' não encontrada.");
            return Ok(_mapper.Map<MovimentacaoReadDto>(mov));
        }

        [HttpPost]
        [HasPermission(Permissions.Movimentacoes.Criar)]
        [ProducesResponseType(typeof(MovimentacaoReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MovimentacaoReadDto>> Create([FromBody] MovimentacaoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var criada = await _service.CreateAsync(dto, usuarioId);
                var readDto = _mapper.Map<MovimentacaoReadDto>(criada);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Problem(ex.Message, StatusCodes.Status401Unauthorized); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Movimentacoes.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] MovimentacaoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Movimentação '{id}' não encontrada.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException) { return NotFoundProblem($"Movimentação '{id}' não encontrada."); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Movimentacoes.Excluir)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFoundProblem($"Movimentação '{id}' não encontrada.");
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFoundProblem($"Movimentação '{id}' não encontrada."); }
        }
    }
}