using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class NotificacaoRepository : INotificacaoRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificacaoRepository(ApplicationDbContext context) => _context = context;

        public async Task AddAsync(Notificacao notificacao)
        {
            _context.Notificacoes.Add(notificacao);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Notificacao>> GetRecentesAsync(int take = 30)
            => await _context.Notificacoes
                .AsNoTracking()
                .OrderByDescending(n => n.CriadoEm)
                .Take(take)
                .ToListAsync();
    }
}
