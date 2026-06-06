using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IDepositoRepository : IRepository<Deposito>
    {
        Task<IEnumerable<Deposito>> GetAllWithAlmoxarifadoAsync();
        Task<Deposito?> GetByIdWithAlmoxarifadoAsync(Guid id);
        Task<bool> HasActiveLotesInAlmoxarifadoAsync(Guid almoxarifadoId);
    }
}
