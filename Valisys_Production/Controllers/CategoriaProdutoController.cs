using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;
using Valisys_Production.DTOs;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasProdutoController : ControllerBase
    {
        private readonly ICategoriaProdutoService _service;
        private readonly IMapper _mapper;

        public CategoriasProdutoController(ICategoriaProdutoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoriaProdutoReadDto>), 200)]
        public async Task<ActionResult<IEnumerable<CategoriaProdutoReadDto>>> GetAll()
        {
            var categorias = await _service.GetAllAsync();
            var categoriaDtos = _mapper.Map<IEnumerable<CategoriaProdutoReadDto>>(categorias);
            return Ok(categoriaDtos);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CategoriaProdutoReadDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<CategoriaProdutoReadDto>> GetById(Guid id)
        {
            var categoria = await _service.GetByIdAsync(id);
            if (categoria == null)
            {
                return NotFound();
            }
            var categoriaDto = _mapper.Map<CategoriaProdutoReadDto>(categoria);
            return Ok(categoriaDto);
        }

        [HttpPost]
        [ProducesResponseType(typeof(CategoriaProdutoReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<CategoriaProdutoReadDto>> PostCategoriaProduto(CategoriaProdutoCreateDto categoriaProdutoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newCategoria = await _service.CreateAsync(categoriaProdutoDto);
                var newCategoriaDto = _mapper.Map<CategoriaProdutoReadDto>(newCategoria);

                return CreatedAtAction(nameof(GetById), new { id = newCategoriaDto.Id }, newCategoriaDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PutCategoriaProduto(Guid id, [FromBody] CategoriaProdutoUpdateDto categoriaProdutoDto)
        {
            if (categoriaProdutoDto == null)
            {
                return BadRequest(new { message = "Os dados da categoria são obrigatórios." });
            }

            if (id != categoriaProdutoDto.Id)
            {
                return BadRequest(new { message = "O ID da rota não corresponde ao ID do corpo da requisição." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _service.UpdateAsync(categoriaProdutoDto);

                if (!updated)
                {
                    return NotFound(new { message = "Categoria não encontrada." });
                }

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> DeleteCategoriaProduto(Guid id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}