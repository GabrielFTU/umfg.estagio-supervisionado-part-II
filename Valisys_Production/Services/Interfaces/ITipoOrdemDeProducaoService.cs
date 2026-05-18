using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface ITipoOrdemDeProducaoService
    {
        Task<TipoOrdemDeProducao> CreateAsync(TipoOrdemDeProducaoCreateDto dto);
        Task<TipoOrdemDeProducao?> GetByIdAsync(Guid id);
        Task<IEnumerable<TipoOrdemDeProducao>> GetAllAsync();
        Task<bool> UpdateAsync(TipoOrdemDeProducaoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
