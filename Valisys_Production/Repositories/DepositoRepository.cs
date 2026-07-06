using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class DepositoRepository : Repository<Deposito>, IDepositoRepository
    {
        public DepositoRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Deposito>> GetAllWithAlmoxarifadoAsync()
            => await _context.Set<Deposito>()
                .Include(d => d.Almoxarifado)
                .AsNoTracking()
                .ToListAsync();

        public async Task<Deposito?> GetByIdWithAlmoxarifadoAsync(Guid id)
            => await _context.Set<Deposito>()
                .Include(d => d.Almoxarifado)
                .FirstOrDefaultAsync(d => d.Id == id);

        public async Task<bool> HasActiveLotesInAlmoxarifadoAsync(Guid almoxarifadoId)
            => await _context.Lotes.AnyAsync(l => l.AlmoxarifadoId == almoxarifadoId && l.Ativo);

        public async Task<int> ContarAsync() => await _dbSet.CountAsync();
    }
}
