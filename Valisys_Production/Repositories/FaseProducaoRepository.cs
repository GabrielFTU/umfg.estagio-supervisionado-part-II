using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class FaseProducaoRepository : Repository<FaseProducao>, IFaseProducaoRepository
    {
        public FaseProducaoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<FaseProducao>> GetAllAsync()
            => await _dbSet.AsNoTracking().OrderBy(f => f.Ordem).ToListAsync();

        public async Task<bool> HasActiveDependenciasAsync(Guid faseId)
            => await _context.RoteiroProducaoEtapas.AnyAsync(e => e.FaseProducaoId == faseId && e.Ativo)
            || await _context.OrdensDeProducao.AnyAsync(o => o.FaseAtualId == faseId && o.Ativo);
    }
}
