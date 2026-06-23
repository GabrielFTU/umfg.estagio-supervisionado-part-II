using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Valisys_Production.Common;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;
using Amazon.S3;

namespace Valisys_Production.Controllers
{
    [Route("api/produtos")]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(object), StatusCodes.Status403Forbidden)]
    public sealed class ProdutosController : BaseController
    {
        private readonly IProdutoService _service;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly ApplicationDbContext _ctx;
        private readonly IS3Service _s3;

        public ProdutosController(
            IProdutoService service, IMapper mapper,
            IWebHostEnvironment env, ApplicationDbContext ctx,
            IS3Service s3)
        {
            _service = service;
            _mapper  = mapper;
            _env     = env;
            _ctx     = ctx;
            _s3      = s3;
        }

        [HttpGet]
        [HasPermission(Permissions.Produtos.Visualizar)]
        public async Task<ActionResult<IEnumerable<ProdutoReadDto>>> GetAll(
            [FromQuery] bool apenasAtivos = false)
        {
            var produtos = await _service.GetAllAsync();
            if (apenasAtivos) produtos = produtos.Where(p => p.Ativo);
            return Ok(_mapper.Map<IEnumerable<ProdutoReadDto>>(produtos));
        }

        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Produtos.Visualizar)]
        public async Task<ActionResult<ProdutoReadDto>> GetById(Guid id)
        {
            var produto = await _ctx.Produtos
                .Include(p => p.CategoriaProduto)
                .Include(p => p.UnidadeMedida)
                .Include(p => p.Fornecedores).ThenInclude(f => f.UnidadeMedidaCompra)
                .Include(p => p.Variacoes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (produto is null) return NotFoundProblem($"Produto '{id}' não encontrado.");
            return Ok(_mapper.Map<ProdutoReadDto>(produto));
        }

        [HttpPost]
        [HasPermission(Permissions.Produtos.Criar)]
        public async Task<ActionResult<ProdutoReadDto>> Create([FromBody] ProdutoCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            try
            {
                var criado = await _service.CreateAsync(dto);
                var result = _mapper.Map<ProdutoReadDto>(criado);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex) { return Problem(ex.Message); }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Produtos.Editar)]
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

        [HttpPatch("{id:guid}/disponibilidade")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> ToggleDisponibilidade(Guid id)
        {
            var resultado = await _service.ToggleDisponivelParaVendaAsync(id);
            if (resultado is null) return NotFoundProblem($"Produto '{id}' não encontrado.");
            return Ok(new { disponivelParaVenda = resultado.Value });
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Produtos.Inativar)]
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

        // ── Upload de imagem ──────────────────────────────────────────────────

        [HttpPost("imagem")]
        public async Task<IActionResult> UploadImagem([FromForm] IFormFile arquivo)
        {
            if (arquivo is null || arquivo.Length == 0)
                return BadRequest(new { message = "Nenhum arquivo enviado." });

            var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
            if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(ext))
                return BadRequest(new { message = "Use JPG, PNG ou WebP." });

            if (arquivo.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Arquivo excede 5 MB." });

            try
            {
                var key = await _s3.UploadAsync(arquivo, "produtos");
                var url = await _s3.GetPresignedUrlAsync(key, expirationMinutes: 60 * 24 * 7); // 7 dias
                return Ok(new { url, key });
            }
            catch (AmazonS3Exception ex)
            {
                return Problem($"Erro ao enviar imagem: {ex.Message}");
            }
        }

        // ── Fornecedores ──────────────────────────────────────────────────────

        [HttpPost("{id:guid}/fornecedores")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> AddFornecedor(Guid id, [FromBody] ProdutoFornecedorCreateDto dto)
        {
            var produto = await _ctx.Produtos.Include(p => p.Fornecedores).FirstOrDefaultAsync(p => p.Id == id);
            if (produto is null) return NotFoundProblem("Produto não encontrado.");

            if (dto.Principal)
                foreach (var f in produto.Fornecedores)
                    f.DefinirPrincipal(false);

            var link = new ProdutoFornecedor(id, dto.PessoaId, dto.FornecedorNome,
                dto.Principal, dto.CodigoFornecedor, dto.PrecoUltimaCompra,
                dto.UnidadeMedidaCompraId, dto.FatorConversao);

            _ctx.ProdutoFornecedores.Add(link);
            await _ctx.SaveChangesAsync();

            await _ctx.Entry(link).Reference(l => l.UnidadeMedidaCompra).LoadAsync();
            return Ok(_mapper.Map<ProdutoFornecedorReadDto>(link));
        }

        [HttpPut("{id:guid}/fornecedores/{fornecedorId:guid}")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> UpdateFornecedor(Guid id, Guid fornecedorId, [FromBody] ProdutoFornecedorUpdateDto dto)
        {
            var link = await _ctx.ProdutoFornecedores.FirstOrDefaultAsync(f => f.Id == fornecedorId && f.ProdutoId == id);
            if (link is null) return NotFoundProblem("Fornecedor não encontrado.");

            link.Atualizar(dto.CodigoFornecedor, dto.PrecoUltimaCompra,
                dto.UnidadeMedidaCompraId, dto.FatorConversao);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:guid}/fornecedores/{fornecedorId:guid}/principal")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> SetPrincipal(Guid id, Guid fornecedorId)
        {
            var fornecedores = await _ctx.ProdutoFornecedores.Where(f => f.ProdutoId == id).ToListAsync();
            if (!fornecedores.Any()) return NotFoundProblem("Produto sem fornecedores.");

            foreach (var f in fornecedores)
                f.DefinirPrincipal(f.Id == fornecedorId);

            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:guid}/fornecedores/{fornecedorId:guid}")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> RemoveFornecedor(Guid id, Guid fornecedorId)
        {
            var link = await _ctx.ProdutoFornecedores.FirstOrDefaultAsync(f => f.Id == fornecedorId && f.ProdutoId == id);
            if (link is null) return NotFoundProblem("Fornecedor não encontrado.");

            _ctx.ProdutoFornecedores.Remove(link);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // ── Variações ─────────────────────────────────────────────────────────

        [HttpPost("{id:guid}/variacoes")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> AddVariacao(Guid id, [FromBody] ProdutoVariacaoCreateDto dto)
        {
            if (!await _ctx.Produtos.AnyAsync(p => p.Id == id))
                return NotFoundProblem("Produto não encontrado.");

            var variacao = new ProdutoVariacao(id, dto.Nome, dto.Valor, dto.CodigoHex);
            _ctx.ProdutoVariacoes.Add(variacao);
            await _ctx.SaveChangesAsync();
            return Ok(_mapper.Map<ProdutoVariacaoReadDto>(variacao));
        }

        [HttpPut("{id:guid}/variacoes/{variacaoId:guid}")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> UpdateVariacao(Guid id, Guid variacaoId, [FromBody] ProdutoVariacaoUpdateDto dto)
        {
            var variacao = await _ctx.ProdutoVariacoes.FirstOrDefaultAsync(v => v.Id == variacaoId && v.ProdutoId == id);
            if (variacao is null) return NotFoundProblem("Variação não encontrada.");

            variacao.Atualizar(dto.Nome, dto.Valor, dto.CodigoHex);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:guid}/variacoes/{variacaoId:guid}")]
        [HasPermission(Permissions.Produtos.Editar)]
        public async Task<IActionResult> RemoveVariacao(Guid id, Guid variacaoId)
        {
            var variacao = await _ctx.ProdutoVariacoes.FirstOrDefaultAsync(v => v.Id == variacaoId && v.ProdutoId == id);
            if (variacao is null) return NotFoundProblem("Variação não encontrada.");

            _ctx.ProdutoVariacoes.Remove(variacao);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }
    }
}
