using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class CondicaoPagamentoRepository(ApplicationDbContext db) : ICondicaoPagamentoRepository
    {
        public Task<CondicaoPagamento?> GetByIdAsync(Guid id) =>
            db.CondicoesPagamento
              .Include(c => c.Parcelas.OrderBy(p => p.Numero))
              .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<IEnumerable<CondicaoPagamento>> GetAllAsync() =>
            await db.CondicoesPagamento
                    .Include(c => c.Parcelas.OrderBy(p => p.Numero))
                    .OrderBy(c => c.Codigo)
                    .ToListAsync();

        public async Task<int> GetProximoCodigoAsync() =>
            await db.CondicoesPagamento.AnyAsync()
                ? await db.CondicoesPagamento.MaxAsync(c => c.Codigo) + 1
                : 1;

        public Task<bool> NomeExisteAsync(string nome, Guid? ignorarId = null) =>
            db.CondicoesPagamento.AnyAsync(c => c.Nome == nome && (ignorarId == null || c.Id != ignorarId));

        public async Task AddAsync(CondicaoPagamento condicao) =>
            await db.CondicoesPagamento.AddAsync(condicao);

        public void Update(CondicaoPagamento condicao) =>
            db.Entry(condicao).State = EntityState.Modified;

        public void RemoveParcelas(IEnumerable<ParcelaCondicao> parcelas) =>
            db.ParcelasCondicao.RemoveRange(parcelas);

        public Task SaveChangesAsync() => db.SaveChangesAsync();
    }
}
