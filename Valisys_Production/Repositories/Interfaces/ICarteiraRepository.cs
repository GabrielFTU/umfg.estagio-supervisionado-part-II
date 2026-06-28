using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface ICarteiraRepository : IRepository<Carteira>
    {
        Task<IEnumerable<Carteira>> GetAtivosAsync();
    }
}
