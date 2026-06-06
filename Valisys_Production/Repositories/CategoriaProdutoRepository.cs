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
    }
}
