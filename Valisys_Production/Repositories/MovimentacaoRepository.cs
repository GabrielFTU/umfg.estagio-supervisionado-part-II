using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class MovimentacaoRepository : Repository<Movimentacao>, IMovimentacaoRepository
    {
        public MovimentacaoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Movimentacao?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(m => m.Produto).ThenInclude(p => p.UnidadeMedida)
                .Include(m => m.AlmoxarifadoOrigem)
                .Include(m => m.DepositoOrigem)
                .Include(m => m.AlmoxarifadoDestino)
                .Include(m => m.DepositoDestino)
                .Include(m => m.Usuario)
                .Include(m => m.PedidoVenda)
                .Include(m => m.OrdemDeProducao)
                .FirstOrDefaultAsync(m => m.Id == id);

        public override async Task<IEnumerable<Movimentacao>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(m => m.Produto).ThenInclude(p => p.UnidadeMedida)
                .Include(m => m.AlmoxarifadoOrigem)
                .Include(m => m.DepositoOrigem)
                .Include(m => m.AlmoxarifadoDestino)
                .Include(m => m.DepositoDestino)
                .Include(m => m.Usuario)
                .Include(m => m.PedidoVenda)
                .OrderByDescending(m => m.DataMovimentacao)
                .ToListAsync();
    }
}
