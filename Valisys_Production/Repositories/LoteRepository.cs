using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class LoteRepository : Repository<Lote>, ILoteRepository
    {
        public LoteRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Lote?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(l => l.Produto)
                .Include(l => l.Almoxarifado)
                .Include(l => l.OrdensDeProducao)
                .FirstOrDefaultAsync(l => l.Id == id);

        public override async Task<IEnumerable<Lote>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(l => l.Produto)
                .Include(l => l.Almoxarifado)
                .Include(l => l.OrdensDeProducao)
                .ToListAsync();

        public async Task<int> ContarAsync() => await _dbSet.CountAsync();

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity is null) return false;
            entity.Cancelar();
            _context.Entry(entity).State = EntityState.Modified;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
