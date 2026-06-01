using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IUsuarioRepository : IRepository<Usuario>
    {
        Task<Usuario?> GetByEmailAsync(string email);
    }
}
