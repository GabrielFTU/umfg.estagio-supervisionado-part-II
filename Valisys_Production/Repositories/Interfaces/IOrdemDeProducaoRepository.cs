using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IOrdemDeProducaoRepository : IRepository<OrdemDeProducao>
    {
        Task<OrdemDeProducao?> GetByCodigoAsync(string codigo);
        Task<IEnumerable<OrdemDeProducaoReadDto>> GetAllReadDtosAsync();
        Task<int> ObterProximoSequencialAsync(int ano);
    }
}
