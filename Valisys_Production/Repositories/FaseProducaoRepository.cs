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
    }
}
