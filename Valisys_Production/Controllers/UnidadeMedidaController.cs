using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnidadesMedidaController : ControllerBase
    {
        private readonly IUnidadeMedidaService _service;
        private readonly IMapper _mapper;

        public UnidadesMedidaController(IUnidadeMedidaService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UnidadeMedidaReadDto>), 200)]
        public async Task<ActionResult<IEnumerable<UnidadeMedidaReadDto>>> GetAll()
        {
            var unidades = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<UnidadeMedidaReadDto>>(unidades));
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(UnidadeMedidaReadDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<UnidadeMedidaReadDto>> GetById(Guid id)
        {
            var unidade = await _service.GetByIdAsync(id);
            if (unidade == null) return NotFound();
            return Ok(_mapper.Map<UnidadeMedidaReadDto>(unidade));
        }

        [HttpPost]
        [ProducesResponseType(typeof(UnidadeMedidaReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<UnidadeMedidaReadDto>> PostUnidadeMedida([FromBody] UnidadeMedidaCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var criada = await _service.CreateAsync(dto);
                var readDto = _mapper.Map<UnidadeMedidaReadDto>(criada);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
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
        public async Task<IActionResult> PutUnidadeMedida(Guid id, [FromBody] UnidadeMedidaUpdateDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "O ID da rota não corresponde ao ID da unidade de medida no corpo da requisição." });

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
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteUnidadeMedida(Guid id)
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
