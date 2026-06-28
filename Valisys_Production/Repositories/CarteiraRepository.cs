using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class CarteiraRepository : Repository<Carteira>, ICarteiraRepository
    {
        public CarteiraRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<Carteira>> GetAllAsync()
            => await _context.Carteiras
                .AsNoTracking()
                .OrderBy(c => c.NomeBanco)
                .ToListAsync();

        public async Task<IEnumerable<Carteira>> GetAtivosAsync()
            => await _context.Carteiras
                .AsNoTracking()
                .Where(c => c.Ativo)
                .OrderBy(c => c.NomeBanco)
                .ToListAsync();
    }
}
