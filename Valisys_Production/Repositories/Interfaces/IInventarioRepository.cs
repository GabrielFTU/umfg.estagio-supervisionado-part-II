using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IInventarioRepository : IRepository<Inventario>
    {
        Task<Inventario?> GetByIdWithItensAsync(Guid id);
        Task<IEnumerable<Inventario>> GetAllWithDepositoAsync();
        Task<int> GetProximoNumeroAsync();
        Task<bool> UpdateWithItensAsync(Inventario inventario, List<ItemInventario> novosItens);
    }
}
