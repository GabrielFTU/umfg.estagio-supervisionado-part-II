using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class TipoOrdemDeProducaoRepository : Repository<TipoOrdemDeProducao>, ITipoOrdemDeProducaoRepository
    {
        public TipoOrdemDeProducaoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<TipoOrdemDeProducao>> GetAllAsync()
            => await _dbSet.AsNoTracking().OrderBy(t => t.Nome).ToListAsync();
    }
}
