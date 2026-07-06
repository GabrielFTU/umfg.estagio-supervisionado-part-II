using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models.Common;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public abstract class Repository<T> : IRepository<T> where T : BaseModels
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        protected Repository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            _dbSet.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T?> GetByIdAsync(Guid id)
            => await _dbSet.FirstOrDefaultAsync(e => e.Id == id);

        public virtual async Task<IEnumerable<T>> GetAllAsync()
            => await _dbSet.AsNoTracking().ToListAsync();

        public virtual async Task<bool> UpdateAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            try { return await _context.SaveChangesAsync() > 0; }
            catch (DbUpdateConcurrencyException) { return false; }
        }

        public virtual async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity is null) return false;
            entity.Desativar();
            _context.Entry(entity).State = EntityState.Modified;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
