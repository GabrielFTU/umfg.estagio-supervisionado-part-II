using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class AlmoxarifadoRepository : Repository<Almoxarifado>, IAlmoxarifadoRepository
    {
        public AlmoxarifadoRepository(ApplicationDbContext context) : base(context) { }

        public async Task<bool> HasActiveLotesAsync(Guid almoxarifadoId)
            => await _context.Lotes.AnyAsync(l => l.AlmoxarifadoId == almoxarifadoId && l.Ativo);
    }
}
