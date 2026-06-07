using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class PedidoVendaRepository : Repository<PedidoVenda>, IPedidoVendaRepository
    {
        public PedidoVendaRepository(ApplicationDbContext context) : base(context) { }

        public async Task<PedidoVenda?> GetByIdWithItensAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(p => p.Itens)
                    .ThenInclude(i => i.Produto)
                        .ThenInclude(p => p.UnidadeMedida)
                .Include(p => p.Cliente)
                .Include(p => p.Representante)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IEnumerable<PedidoVenda>> GetAllWithClienteAsync()
            => await _dbSet.AsNoTracking()
                .Include(p => p.Cliente)
                .Include(p => p.Representante)
                .Include(p => p.Itens)
                .OrderByDescending(p => p.DataEmissao)
                .ToListAsync();

        public async Task<int> GetProximoCodigoAsync()
        {
            var ultimo = await _dbSet.AsNoTracking()
                .OrderByDescending(p => p.Codigo)
                .Select(p => p.Codigo)
                .FirstOrDefaultAsync();
            return ultimo + 1;
        }

        public async Task<bool> UpdateWithItensAsync(PedidoVenda pedido, List<ItemPedido> novosItens)
        {
            var existente = await _dbSet
                .Include(p => p.Itens)
                .FirstOrDefaultAsync(p => p.Id == pedido.Id);

            if (existente is null) return false;

            _context.Entry(existente).CurrentValues.SetValues(pedido);
            _context.ItensPedido.RemoveRange(existente.Itens);
            existente.LimparItens();

            foreach (var item in novosItens)
                existente.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }
    }
}
