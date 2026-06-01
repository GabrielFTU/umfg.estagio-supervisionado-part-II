using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IRoteiroProducaoRepository : IRepository<RoteiroProducao>
    {
        Task<bool> UpdateWithEtapasAsync(RoteiroProducao roteiro, List<RoteiroProducaoEtapa> novasEtapas);
    }
}
