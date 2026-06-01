using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Valisys_Production.Common;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/produtos")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class ProdutosController : BaseController
    {
        private readonly IProdutoService _service;
        private readonly IMapper _mapper;

        public ProdutosController(IProdutoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        [HasPermission(Permissions.Produtos.Visualizar)]
        [ProducesResponseType(typeof(IEnumerable<ProdutoReadDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ProdutoReadDto>>> GetAll(
            [FromQuery] bool apenasAtivos = false)
        {
            var produtos = await _service.GetAllAsync();
            if (apenasAtivos) produtos = produtos.Where(p => p.Ativo);
            return Ok(_mapper.Map<IEnumerable<ProdutoReadDto>>(produtos));
        }

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Produtos.Visualizar)]
        [ProducesResponseType(typeof(ProdutoReadDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProdutoReadDto>> GetById(Guid id)
        {
            var produto = await _service.GetByIdAsync(id);
            if (produto is null) return NotFoundProblem($"Produto '{id}' não encontrado.");
            return Ok(_mapper.Map<ProdutoReadDto>(produto));
        }

        [HttpPost]
        [HasPermission(Permissions.Produtos.Criar)]
        [ProducesResponseType(typeof(ProdutoReadDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ProdutoReadDto>> Create([FromBody] ProdutoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var criado = await _service.CreateAsync(dto);
                var readDto = _mapper.Map<ProdutoReadDto>(criado);
                return CreatedAtAction(nameof(GetById), new { id = readDto.Id }, readDto);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Produtos.Editar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProdutoUpdateDto dto)
        {
            if (id != dto.Id) return Problem("O ID da rota não corresponde ao ID do corpo.");
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var ok = await _service.UpdateAsync(dto);
                if (!ok) return NotFoundProblem($"Produto '{id}' não encontrado.");
                return NoContent();
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFoundProblem(ex.Message); }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Produtos.Inativar)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ok = await _service.DeleteAsync(id);
                if (!ok) return NotFoundProblem($"Produto '{id}' não encontrado.");
                return NoContent();
            }
            catch (InvalidOperationException ex) { return ConflictProblem(ex.Message); }
        }
    }
}