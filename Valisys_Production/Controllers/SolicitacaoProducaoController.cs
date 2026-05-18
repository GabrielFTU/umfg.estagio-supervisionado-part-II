using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/solicitacoes-producao")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class SolicitacoesProducaoController : BaseController
    {
        private readonly ISolicitacaoProducaoService _service;
        private readonly IMapper _mapper;

        public SolicitacoesProducaoController(ISolicitacaoProducaoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Solicitacoes.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<SolicitacaoProducaoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<SolicitacaoProducaoReadDto>>> GetAll()
        {
            var solicitacoes = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<SolicitacaoProducaoReadDto>>(solicitacoes));
        }

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Solicitacoes.Visualizar)]
        [ProducesResponseType(typeof(SolicitacaoProducaoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SolicitacaoProducaoReadDto>> GetById(Guid id)
        {
            var solicitacao = await _service.GetByIdAsync(id);
            if (solicitacao is null) return NotFoundProblem($"Solicitação '{id}' não encontrada.");
            return Ok(_mapper.Map<SolicitacaoProducaoReadDto>(solicitacao));
        }

        [HttpPost]
        [HasPermission(Permissions.Solicitacoes.Criar)]
        [ProducesResponseType(typeof(SolicitacaoProducaoReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SolicitacaoProducaoReadDto>> Create(
            [FromBody] SolicitacaoProducaoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var solicitacao = _mapper.Map<SolicitacaoProducao>(dto);
                var criada = await _service.CreateAsync(solicitacao);
                var readDto = _mapper.Map<SolicitacaoProducaoReadDto>(criada);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Solicitacoes.Criar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] SolicitacaoProducaoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var solicitacao = _mapper.Map<SolicitacaoProducao>(dto);
                var ok = await _service.UpdateAsync(solicitacao);
                if (!ok) return NotFoundProblem($"Solicitação '{id}' não encontrada.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (InvalidOperationException ex) 
            { 
                return Problem(ex.Message); 
            }
        }

        [HttpPost("{id:guid}/aprovar")]
        [HasPermission(Permissions.Solicitacoes.Aprovar)]
        [ProducesResponseType(typeof(List<OrdemDeProducaoReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<List<OrdemDeProducaoReadDto>>> Aprovar(Guid id)
        {
            try
            {
                var aprovadorId = GetAuthenticatedUserId();
                var ordensGeradas = await _service.AprovarSolicitacaoAsync(id, aprovadorId);
                return Ok(_mapper.Map<List<OrdemDeProducaoReadDto>>(ordensGeradas));
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (UnauthorizedAccessException ex) 
            { 
                return Problem(ex.Message, StatusCodes.Status401Unauthorized); 
            }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Solicitacoes.Cancelar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFoundProblem($"Solicitação '{id}' não encontrada.");
                return NoContent();
            }
            catch (InvalidOperationException ex) 
            { 
                return ConflictProblem(ex.Message); 
            }
        }
    }
}