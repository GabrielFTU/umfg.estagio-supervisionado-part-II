using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/carteiras")]
    public class CarteirasController : ControllerBase
    {
        private readonly ICarteiraService _service;
        private readonly IMovimentacaoCarteiraService _movimentacaoService;
        private readonly IMapper _mapper;

        public CarteirasController(ICarteiraService service, IMovimentacaoCarteiraService movimentacaoService, IMapper mapper)
        {
            _service = service;
            _movimentacaoService = movimentacaoService;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CarteiraReadDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var carteiras = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<CarteiraReadDto>>(carteiras));
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CarteiraReadDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var carteira = await _service.GetByIdAsync(id);
            if (carteira is null) return NotFound();
            return Ok(_mapper.Map<CarteiraReadDto>(carteira));
        }

        [HttpPost]
        [ProducesResponseType(typeof(CarteiraReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CarteiraCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                var result = _mapper.Map<CarteiraReadDto>(created);
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
        public async Task<IActionResult> Update(Guid id, [FromBody] CarteiraUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest(new { message = "ID inconsistente." });

            try
            {
                var ok = await _service.UpdateAsync(dto);
                return ok ? NoContent() : NotFound();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                return ok ? NoContent() : NotFound();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id:guid}/movimentacoes")]
        [ProducesResponseType(typeof(IEnumerable<MovimentacaoCarteiraReadDto>), 200)]
        public async Task<IActionResult> GetMovimentacoes(Guid id)
        {
            var movimentacoes = await _movimentacaoService.ListarPorCarteiraAsync(id);
            return Ok(_mapper.Map<IEnumerable<MovimentacaoCarteiraReadDto>>(movimentacoes));
        }

        [HttpPatch("{id:guid}/ativar")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Ativar(Guid id)
        {
            try
            {
                var ok = await _service.AtivarAsync(id);
                return ok ? NoContent() : NotFound();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
