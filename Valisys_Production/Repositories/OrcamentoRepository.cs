using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class OrcamentoRepository : Repository<Orcamento>, IOrcamentoRepository
    {
        public OrcamentoRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Orcamento?> GetByIdWithItensAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(o => o.Itens)
                    .ThenInclude(i => i.Produto)
                        .ThenInclude(p => p.UnidadeMedida)
                .Include(o => o.Cliente)
                .Include(o => o.Representante)
                .FirstOrDefaultAsync(o => o.Id == id);

        public async Task<IEnumerable<Orcamento>> GetAllWithClienteAsync()
            => await _dbSet.AsNoTracking()
                .Include(o => o.Cliente)
                .Include(o => o.Representante)
                .Include(o => o.Itens)
                    .ThenInclude(i => i.Produto)
                .OrderByDescending(o => o.DataEmissao)
                .ToListAsync();

        public async Task<int> GetProximoCodigoAsync()
        {
            var ultimo = await _dbSet.AsNoTracking()
                .OrderByDescending(o => o.Codigo)
                .Select(o => o.Codigo)
                .FirstOrDefaultAsync();
            return ultimo + 1;
        }

        public async Task<bool> UpdateWithItensAsync(Orcamento orcamento, List<ItemOrcamento> novosItens)
        {
            var existente = await _dbSet
                .Include(o => o.Itens)
                .FirstOrDefaultAsync(o => o.Id == orcamento.Id);

            if (existente is null) return false;

            _context.Entry(existente).CurrentValues.SetValues(orcamento);
            _context.ItensOrcamento.RemoveRange(existente.Itens);
            existente.LimparItens();

            foreach (var item in novosItens)
                existente.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }
    }
}
