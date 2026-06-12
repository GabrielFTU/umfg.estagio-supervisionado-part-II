using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class FichaTecnicaRepository : Repository<FichaTecnica>, IFichaTecnicaRepository
    {
        public FichaTecnicaRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<FichaTecnica?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(f => f.Produto)
                .Include(f => f.Itens)
                    .ThenInclude(i => i.ProdutoComponente)
                        .ThenInclude(p => p.UnidadeMedida)
                .Include(f => f.Itens)
                    .ThenInclude(i => i.FaseProducao)
                .Include(f => f.Itens)
                    .ThenInclude(i => i.Cor)
                .Include(f => f.Sequencias)
                    .ThenInclude(s => s.FaseProducao)
                .FirstOrDefaultAsync(f => f.Id == id);

        public override async Task<IEnumerable<FichaTecnica>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(f => f.Produto)
                .OrderBy(f => f.Produto.CodigoInternoProduto)
                .ToListAsync();

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity is null) return false;
            entity.Inativar();
            _context.Entry(entity).State = EntityState.Modified;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateWithItemsAsync(FichaTecnica ficha, List<FichaTecnicaItem> novosItens, List<FichaTecnicaSequencia> novasSequencias)
        {
            var fichaExistente = await _dbSet.FirstOrDefaultAsync(f => f.Id == ficha.Id);
            if (fichaExistente is null) return false;

            _context.Entry(fichaExistente).CurrentValues.SetValues(ficha);

            await _context.FichaTecnicaItens
                .Where(i => i.FichaTecnicaId == ficha.Id)
                .ExecuteDeleteAsync();

            await _context.FichaTecnicaSequencias
                .Where(s => s.FichaTecnicaId == ficha.Id)
                .ExecuteDeleteAsync();

            foreach (var item in novosItens)
            {
                item.SetFichaTecnicaId(ficha.Id);
                _context.FichaTecnicaItens.Add(item);
            }

            foreach (var seq in novasSequencias)
            {
                seq.SetFichaTecnicaId(ficha.Id);
                _context.FichaTecnicaSequencias.Add(seq);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> GetUltimoCodigoAsync()
            => await _dbSet.AsNoTracking()
                .OrderByDescending(f => f.CodigoFicha)
                .Select(f => f.CodigoFicha)
                .FirstOrDefaultAsync();
    }
}
