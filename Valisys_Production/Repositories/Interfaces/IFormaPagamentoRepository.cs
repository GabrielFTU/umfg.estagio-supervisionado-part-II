using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IFormaPagamentoRepository : IRepository<FormaPagamento>
    {
        Task<FormaPagamento?> GetByIdWithVendedoresAsync(Guid id);
        Task<IEnumerable<FormaPagamento>> GetAllWithVendedoresAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> CodigoExisteAsync(int codigo, Guid? ignorarId = null);
    }
}
