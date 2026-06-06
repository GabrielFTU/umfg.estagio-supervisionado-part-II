using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepositoController : ControllerBase
    {
        private readonly IDepositoService _service;
        private readonly IMapper _mapper;

        public DepositoController(IDepositoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DepositoReadDto>), 200)]
        public async Task<ActionResult<IEnumerable<DepositoReadDto>>> GetAll()
        {
            var depositos = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<DepositoReadDto>>(depositos));
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(DepositoReadDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DepositoReadDto>> GetById(Guid id)
        {
            var deposito = await _service.GetByIdAsync(id);
            if (deposito == null) return NotFound();
            return Ok(_mapper.Map<DepositoReadDto>(deposito));
        }

        [HttpPost]
        [ProducesResponseType(typeof(DepositoReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<DepositoReadDto>> PostDeposito(DepositoCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                var result = _mapper.Map<DepositoReadDto>(created);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> PutDeposito(Guid id, DepositoUpdateDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "O ID da rota não corresponde ao ID do depósito no corpo da requisição." });

            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(dto);
                if (!updated) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> DeleteDeposito(Guid id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}
