using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class FinalidadeRepository(ApplicationDbContext db) : IFinalidadeRepository
    {
        public Task<Finalidade?> GetByIdAsync(Guid id) =>
            db.Finalidades.FirstOrDefaultAsync(f => f.Id == id);

        public async Task<IEnumerable<Finalidade>> GetAllAsync() =>
            await db.Finalidades.OrderBy(f => f.Codigo).ToListAsync();

        public async Task<int> GetProximoCodigoAsync() =>
            await db.Finalidades.AnyAsync() ? await db.Finalidades.MaxAsync(f => f.Codigo) + 1 : 1;

        public Task<bool> NomeExisteAsync(string nome, Guid? ignorarId = null) =>
            db.Finalidades.AnyAsync(f => f.Nome == nome && (ignorarId == null || f.Id != ignorarId));

        public async Task AddAsync(Finalidade finalidade) => await db.Finalidades.AddAsync(finalidade);
        public void Update(Finalidade finalidade) => db.Entry(finalidade).State = EntityState.Modified;
        public Task SaveChangesAsync() => db.SaveChangesAsync();
    }
}
