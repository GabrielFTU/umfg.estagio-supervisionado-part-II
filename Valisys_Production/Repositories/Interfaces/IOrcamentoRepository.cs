using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IOrcamentoRepository : IRepository<Orcamento>
    {
        Task<Orcamento?> GetByIdWithItensAsync(Guid id);
        Task<IEnumerable<Orcamento>> GetAllWithClienteAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> UpdateWithItensAsync(Orcamento orcamento, List<ItemOrcamento> novosItens);
    }
}
