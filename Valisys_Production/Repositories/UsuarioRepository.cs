using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class UsuarioRepository : Repository<Usuario>, IUsuarioRepository
    {
        public UsuarioRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Usuario?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(u => u.Id == id);

        public override async Task<IEnumerable<Usuario>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(u => u.Perfil)
                .ToListAsync();

        public async Task<Usuario?> GetByEmailAsync(string email)
            => await _dbSet.AsNoTracking()
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(u => u.Email == email);
    }
}
