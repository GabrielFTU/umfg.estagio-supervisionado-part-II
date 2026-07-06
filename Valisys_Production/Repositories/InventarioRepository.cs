using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class InventarioRepository : Repository<Inventario>, IInventarioRepository
    {
        public InventarioRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Inventario?> GetByIdWithItensAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(i => i.Deposito)
                .Include(i => i.Itens).ThenInclude(it => it.Produto)
                .Include(i => i.UsuarioAbertura)
                .FirstOrDefaultAsync(i => i.Id == id);

        public async Task<IEnumerable<Inventario>> GetAllWithDepositoAsync()
            => await _dbSet.AsNoTracking()
                .Include(i => i.Deposito)
                .Include(i => i.Itens).ThenInclude(it => it.Produto)
                .Include(i => i.UsuarioAbertura)
                .OrderByDescending(i => i.DataAbertura)
                .ToListAsync();

        public async Task<int> GetProximoNumeroAsync()
        {
            var ultimo = await _dbSet.AsNoTracking()
                .OrderByDescending(i => i.Numero)
                .Select(i => i.Numero)
                .FirstOrDefaultAsync();
            return ultimo + 1;
        }

        public async Task<bool> UpdateWithItensAsync(Inventario inventario, List<ItemInventario> novosItens)
        {
            var existente = await _dbSet
                .Include(i => i.Itens)
                .FirstOrDefaultAsync(i => i.Id == inventario.Id);

            if (existente is null) return false;

            _context.Entry(existente).CurrentValues.SetValues(inventario);
            _context.Set<ItemInventario>().RemoveRange(existente.Itens);
            existente.LimparItens();

            foreach (var item in novosItens)
                existente.AdicionarItem(item.ProdutoId, item.QuantidadeContada);

            foreach (var novo in existente.Itens)
                _context.Entry(novo).State = EntityState.Added;

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
