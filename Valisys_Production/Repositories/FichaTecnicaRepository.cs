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
            var fichaExistente = await _dbSet
                .Include(f => f.Itens)
                .Include(f => f.Sequencias)
                .FirstOrDefaultAsync(f => f.Id == ficha.Id);

            if (fichaExistente is null) return false;

            _context.Entry(fichaExistente).CurrentValues.SetValues(ficha);

            _context.FichaTecnicaItens.RemoveRange(fichaExistente.Itens);
            fichaExistente.LimparItens();
            foreach (var item in novosItens)
                fichaExistente.AdicionarItem(item);

            _context.FichaTecnicaSequencias.RemoveRange(fichaExistente.Sequencias);
            fichaExistente.LimparSequencias();
            foreach (var seq in novasSequencias)
                fichaExistente.AdicionarSequencia(seq);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }

        public async Task<string?> GetUltimoCodigoAsync()
            => await _dbSet.AsNoTracking()
                .OrderByDescending(f => f.CodigoFicha)
                .Select(f => f.CodigoFicha)
                .FirstOrDefaultAsync();
    }
}
