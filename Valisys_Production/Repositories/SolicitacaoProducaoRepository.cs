using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class SolicitacaoProducaoRepository : Repository<SolicitacaoProducao>, ISolicitacaoProducaoRepository
    {
        public SolicitacaoProducaoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<SolicitacaoProducao?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(s => s.Produto)
                .Include(s => s.Encarregado)
                .Include(s => s.Itens)
                .FirstOrDefaultAsync(s => s.Id == id);

        public override async Task<IEnumerable<SolicitacaoProducao>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(s => s.Produto)
                .Include(s => s.Encarregado)
                .ToListAsync();

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
