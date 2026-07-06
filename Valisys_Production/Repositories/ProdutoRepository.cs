using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class ProdutoRepository : Repository<Produto>, IProdutoRepository
    {
        public ProdutoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Produto?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(p => p.CategoriaProduto)
                .Include(p => p.UnidadeMedida)
                .FirstOrDefaultAsync(p => p.Id == id);

        public override async Task<IEnumerable<Produto>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(p => p.CategoriaProduto)
                .Include(p => p.UnidadeMedida)
                .ToListAsync();

        public override async Task<Produto> AddAsync(Produto entity)
        {
            _dbSet.Add(entity);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(entity.Id) ?? entity;
        }

        public async Task<int?> GetUltimoCodigoAsync()
            => await _dbSet.AsNoTracking()
                .OrderByDescending(p => p.CodigoInternoProduto)
                .Select(p => (int?)p.CodigoInternoProduto)
                .FirstOrDefaultAsync();

        public async Task<int> ContarProdutosPorCategoriaAsync(Guid categoriaProdutoId)
            => await _dbSet.AsNoTracking()
                .CountAsync(p => p.CategoriaProdutoId == categoriaProdutoId);
    }
}
