using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class RoteiroProducaoRepository : Repository<RoteiroProducao>, IRoteiroProducaoRepository
    {
        public RoteiroProducaoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<RoteiroProducao?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(r => r.Produto)
                .Include(r => r.Etapas.OrderBy(e => e.Ordem))
                    .ThenInclude(e => e.FaseProducao)
                .FirstOrDefaultAsync(r => r.Id == id);

        public override async Task<IEnumerable<RoteiroProducao>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(r => r.Produto)
                .Include(r => r.Etapas)
                .OrderBy(r => r.Produto.Nome)
                .ToListAsync();

        public async Task<bool> UpdateWithEtapasAsync(RoteiroProducao roteiro, List<RoteiroProducaoEtapa> novasEtapas)
        {
            var roteiroExistente = await _dbSet
                .Include(r => r.Etapas)
                .FirstOrDefaultAsync(r => r.Id == roteiro.Id);

            if (roteiroExistente is null) return false;

            _context.Entry(roteiroExistente).CurrentValues.SetValues(roteiro);
            _context.RoteiroProducaoEtapas.RemoveRange(roteiroExistente.Etapas);
            roteiroExistente.LimparEtapas();

            foreach (var etapa in novasEtapas)
                roteiroExistente.AdicionarEtapa(etapa);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }
    }
}
