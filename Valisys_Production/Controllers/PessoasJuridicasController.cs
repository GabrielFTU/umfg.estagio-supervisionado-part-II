using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PessoasJuridicasController : ControllerBase
    {
        private readonly IPessoaJuridicaService _service;
        private readonly IMapper _mapper;

        public PessoasJuridicasController(IPessoaJuridicaService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PessoaJuridicaReadDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<PessoaJuridicaReadDto>>(items));
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(PessoaJuridicaReadDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item is null) return NotFound();
            return Ok(_mapper.Map<PessoaJuridicaReadDto>(item));
        }

        [HttpPost]
        [ProducesResponseType(typeof(PessoaJuridicaReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Post(PessoaJuridicaCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                var result = _mapper.Map<PessoaJuridicaReadDto>(created);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Put(Guid id, PessoaJuridicaUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                if (!updated) return NotFound();
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPatch("{id:guid}/reativar")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Reativar(Guid id)
        {
            var result = await _service.ReativarAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id:guid}/bloquear")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Bloquear(Guid id)
        {
            var result = await _service.BloquearCreditoAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id:guid}/desbloquear")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Desbloquear(Guid id)
        {
            var result = await _service.DesbloquearCreditoAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }
    }
}
