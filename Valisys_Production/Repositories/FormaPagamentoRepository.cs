using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class FormaPagamentoRepository : Repository<FormaPagamento>, IFormaPagamentoRepository
    {
        public FormaPagamentoRepository(ApplicationDbContext context) : base(context) { }

        public async Task<FormaPagamento?> GetByIdWithVendedoresAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(f => f.Vendedores).ThenInclude(v => v.Vendedor)
                .FirstOrDefaultAsync(f => f.Id == id);

        public async Task<IEnumerable<FormaPagamento>> GetAllWithVendedoresAsync()
            => await _dbSet.AsNoTracking()
                .Include(f => f.Vendedores).ThenInclude(v => v.Vendedor)
                .OrderBy(f => f.Codigo)
                .ToListAsync();

        public async Task<int> GetProximoCodigoAsync()
        {
            var ultimo = await _dbSet.AsNoTracking()
                .OrderByDescending(f => f.Codigo)
                .Select(f => f.Codigo)
                .FirstOrDefaultAsync();
            return ultimo + 1;
        }

        public async Task<bool> CodigoExisteAsync(int codigo, Guid? ignorarId = null)
            => await _dbSet.AnyAsync(f =>
                f.Codigo == codigo &&
                (ignorarId == null || f.Id != ignorarId));

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity is null) return false;
            entity.Desativar();
            _context.Entry(entity).State = EntityState.Modified;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
