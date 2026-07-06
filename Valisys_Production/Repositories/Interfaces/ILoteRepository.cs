using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface ILoteRepository : IRepository<Lote>
    {
        Task<int> ContarAsync();
    }
}
