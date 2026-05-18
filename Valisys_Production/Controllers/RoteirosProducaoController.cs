using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/roteiros-producao")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class RoteirosProducaoController : BaseController
    {
        private readonly IRoteiroProducaoService _service;
        private readonly IMapper _mapper;

        public RoteirosProducaoController(IRoteiroProducaoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Roteiros.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<RoteiroProducaoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<RoteiroProducaoReadDto>>> GetAll()
            => Ok(_mapper.Map<IEnumerable<RoteiroProducaoReadDto>>(await _service.GetAllAsync()));

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Roteiros.Visualizar)]
        [ProducesResponseType(typeof(RoteiroProducaoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoteiroProducaoReadDto>> GetById(Guid id)
        {
            var roteiro = await _service.GetByIdAsync(id);
            if (roteiro is null) return NotFoundProblem($"Roteiro '{id}' não encontrado.");
            return Ok(_mapper.Map<RoteiroProducaoReadDto>(roteiro));
        }

        [HttpPost]
        [HasPermission(Permissions.Roteiros.Criar)]
        [ProducesResponseType(typeof(RoteiroProducaoReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoteiroProducaoReadDto>> Create([FromBody] RoteiroProducaoCreateDto dto)
        {
            try
            {
                var criado = await _service.CreateAsync(dto);
                var readDto = _mapper.Map<RoteiroProducaoReadDto>(criado);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Roteiros.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] RoteiroProducaoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Roteiro '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Roteiros.Excluir)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFoundProblem($"Roteiro '{id}' não encontrado.");
            return NoContent();
        }
    }
}