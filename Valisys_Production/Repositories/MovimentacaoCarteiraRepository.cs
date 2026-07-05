using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class MovimentacaoCarteiraRepository : IMovimentacaoCarteiraRepository
    {
        private readonly ApplicationDbContext _context;

        public MovimentacaoCarteiraRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<MovimentacaoCarteira>> GetByCarteiraIdAsync(Guid carteiraId)
            => await _context.MovimentacoesCarteira
                .AsNoTracking()
                .Include(m => m.Carteira)
                .Where(m => m.CarteiraId == carteiraId)
                .OrderByDescending(m => m.DataMovimentacao)
                .ThenByDescending(m => m.CriadoEm)
                .ToListAsync();

        public async Task<IEnumerable<MovimentacaoCarteira>> GetAllAsync()
            => await _context.MovimentacoesCarteira
                .AsNoTracking()
                .Include(m => m.Carteira)
                .OrderByDescending(m => m.DataMovimentacao)
                .ThenByDescending(m => m.CriadoEm)
                .ToListAsync();
    }
}
