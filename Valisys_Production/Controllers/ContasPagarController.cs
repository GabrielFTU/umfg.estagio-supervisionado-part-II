using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/contas-pagar")]
    public class ContasPagarController : ControllerBase
    {
        private readonly IContaPagarService _service;
        private readonly IMapper _mapper;

        public ContasPagarController(IContaPagarService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ContaPagarReadDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var contas = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<ContaPagarReadDto>>(contas));
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ContaPagarReadDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var conta = await _service.GetByIdAsync(id);
            if (conta is null) return NotFound();
            return Ok(_mapper.Map<ContaPagarReadDto>(conta));
        }

        [HttpGet("periodo")]
        [ProducesResponseType(typeof(IEnumerable<ContaPagarReadDto>), 200)]
        public async Task<IActionResult> GetByPeriodo([FromQuery] DateTime inicio, [FromQuery] DateTime fim)
        {
            var contas = await _service.GetByPeriodoAsync(inicio, fim);
            return Ok(_mapper.Map<IEnumerable<ContaPagarReadDto>>(contas));
        }

        [HttpPost]
        [ProducesResponseType(typeof(ContaPagarReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] ContaPagarCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                var result = _mapper.Map<ContaPagarReadDto>(created);
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
        public async Task<IActionResult> Update(Guid id, [FromBody] ContaPagarUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest(new { message = "ID da rota não corresponde ao corpo." });
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(dto);
                return updated ? NoContent() : NotFound();
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
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
                return deleted ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("baixar-parcela")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> BaixarParcela([FromBody] ParcelaBaixaDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _service.BaixarParcelaAsync(dto);
                return result ? NoContent() : NotFound();
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (DbUpdateConcurrencyException ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ERRO_BAIXA] Concorrência: {ex.Message}");
                return Conflict(new { message = "Esta parcela já foi paga ou alterada por outra operação. Atualize a página e tente novamente." });
            }
            catch (DbUpdateException ex)
            {
                var errorMessage = ex.InnerException?.InnerException?.Message
                    ?? ex.InnerException?.Message
                    ?? ex.Message;

                System.Diagnostics.Debug.WriteLine($"[ERRO_BAIXA] {errorMessage}");
                System.Diagnostics.Debug.WriteLine($"[ERRO_BAIXA] StackTrace: {ex.StackTrace}");

                return Conflict(new { message = errorMessage });
            }
        }

        [HttpPost("estornar-parcela")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> EstornarParcela([FromBody] ParcelaEstornoDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _service.EstornarParcelaAsync(dto);
                return result ? NoContent() : NotFound();
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { message = "Esta parcela já foi alterada por outra operação. Atualize a página e tente novamente." });
            }
            catch (DbUpdateException ex)
            {
                return Conflict(new { message = ex.InnerException?.Message ?? "Não foi possível estornar a baixa. Tente novamente." });
            }
        }

        [HttpPost("verificar-vencimentos")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> VerificarVencimentos()
        {
            await _service.VerificarVencimentosAsync();
            return NoContent();
        }
    }
}
