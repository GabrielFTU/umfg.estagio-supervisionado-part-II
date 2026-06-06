using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IUnidadeMedidaRepository : IRepository<UnidadeMedida>
    {
        Task<bool> HasActiveProdutosAsync(Guid unidadeId);
    }
}
