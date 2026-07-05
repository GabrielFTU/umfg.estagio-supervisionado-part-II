using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class CategoriaProdutoRepository : Repository<CategoriaProduto>, ICategoriaProdutoRepository
    {
        public CategoriaProdutoRepository(ApplicationDbContext context) : base(context) { }

        public async Task<bool> HasActiveProdutosAsync(Guid categoriaId)
            => await _context.Produtos
                .AnyAsync(p => p.CategoriaProdutoId == categoriaId && p.Ativo);

        public async Task<bool> ExistsByCodigoAsync(string codigo, Guid? excludeId = null)
            => await _context.CategoriasProduto
                .AnyAsync(c => c.CodigoInterno == codigo && (excludeId == null || c.Id != excludeId));
    }
}
