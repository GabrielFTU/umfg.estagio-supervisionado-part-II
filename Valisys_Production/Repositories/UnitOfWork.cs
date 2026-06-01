using Microsoft.EntityFrameworkCore.Storage;
using Valisys_Production.Data;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context) => _context = context;

        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task CommitAsync() => await _context.SaveChangesAsync();

        public Task RollbackAsync()
        {
            _context.ChangeTracker.Clear();
            return Task.CompletedTask;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
            => await _context.Database.BeginTransactionAsync();
    }
}
