using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/Pessoas")]
    [Authorize]
    public class PessoasController : ControllerBase
    {
        private readonly ApplicationDbContext _ctx;

        public PessoasController(ApplicationDbContext ctx)
        {
            _ctx = ctx;
        }

        /// <summary>
        /// Busca pessoas pelo nome (suporta filtro por papel: Fornecedor, Cliente, etc.)
        /// GET /api/Pessoas?busca=acme&papel=Fornecedor
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Buscar(
            [FromQuery] string? busca,
            [FromQuery] string? papel)
        {
            var query = _ctx.Pessoas.Where(p => p.Ativo);

            // Filtro por papel (flags enum)
            if (!string.IsNullOrWhiteSpace(papel) && Enum.TryParse<PapelPessoa>(papel, ignoreCase: true, out var papelEnum))
                query = query.Where(p => (p.PapelPessoa & papelEnum) == papelEnum);

            // Busca por nome ou nome fantasia
            if (!string.IsNullOrWhiteSpace(busca))
            {
                var termo = busca.Trim().ToLower();
                query = query.Where(p =>
                    p.Nome.ToLower().Contains(termo) ||
                    (p.NomeFantasia != null && p.NomeFantasia.ToLower().Contains(termo)));
            }

            var resultado = await query
                .OrderBy(p => p.NomeFantasia ?? p.Nome)
                .Take(30)
                .Select(p => new
                {
                    id   = p.Id,
                    nome = p.NomeFantasia ?? p.Nome,
                    nomeCompleto = p.Nome,
                    papel = p.PapelPessoa.ToString(),
                })
                .ToListAsync();

            return Ok(resultado);
        }
    }
}
