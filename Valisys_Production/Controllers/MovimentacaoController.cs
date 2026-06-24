using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
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
            _mapper  = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Movimentacoes.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<MovimentacaoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<MovimentacaoReadDto>>> GetAll(
            [FromQuery] Guid?   produtoId   = null,
            [FromQuery] Guid?   depositoId  = null,
            [FromQuery] string? tipo        = null,
            [FromQuery] string? usuarioNome = null,
            [FromQuery] DateTime? de        = null,
            [FromQuery] DateTime? ate       = null)
        {
            var movs = await _service.GetAllAsync();

            if (produtoId.HasValue)
                movs = movs.Where(m => m.ProdutoId == produtoId.Value);

            if (depositoId.HasValue)
                movs = movs.Where(m => m.DepositoOrigemId == depositoId.Value
                                    || m.DepositoDestinoId == depositoId.Value);

            if (!string.IsNullOrEmpty(tipo) && Enum.TryParse<TipoMovimentacao>(tipo, true, out var tipoEnum))
                movs = movs.Where(m => m.Tipo == tipoEnum);

            if (de.HasValue)
                movs = movs.Where(m => m.DataMovimentacao >= de.Value.ToUniversalTime());

            if (ate.HasValue)
                movs = movs.Where(m => m.DataMovimentacao <= ate.Value.ToUniversalTime().AddDays(1).AddSeconds(-1));

            var dtos = _mapper.Map<IEnumerable<MovimentacaoReadDto>>(
                movs.OrderByDescending(m => m.DataMovimentacao));

            if (!string.IsNullOrEmpty(usuarioNome))
                dtos = dtos.Where(d => d.UsuarioNome.Contains(usuarioNome, StringComparison.OrdinalIgnoreCase));

            return Ok(dtos);
        }

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

        [HttpPost("lote")]
        [HasPermission(Permissions.Movimentacoes.Criar)]
        [ProducesResponseType(typeof(IEnumerable<MovimentacaoReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<MovimentacaoReadDto>>> CreateLote(
            [FromBody] MovimentacaoLoteCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var usuarioId = GetAuthenticatedUserId();
                var criadas   = await _service.CreateLoteAsync(dto, usuarioId);
                return Ok(_mapper.Map<IEnumerable<MovimentacaoReadDto>>(criadas));
            }
            catch (ArgumentException ex)          { return Problem(ex.Message); }
            catch (UnauthorizedAccessException ex) { return Problem(ex.Message, StatusCodes.Status401Unauthorized); }
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
