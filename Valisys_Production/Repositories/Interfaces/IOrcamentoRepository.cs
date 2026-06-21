using Valisys_Production.Models;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IOrcamentoRepository : IRepository<Orcamento>
    {
        Task<Orcamento?> GetByIdWithItensAsync(Guid id);
        Task<IEnumerable<Orcamento>> GetAllWithClienteAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> UpdateWithItensAsync(Orcamento orcamento, List<ItemOrcamento> novosItens);
        Task<bool> AtualizarStatusAsync(Guid id, StatusOrcamento novoStatus, Guid? pedidoVendaId = null);
    }
}
