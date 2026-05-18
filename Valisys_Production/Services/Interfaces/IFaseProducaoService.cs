using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IFaseProducaoService
    {
        Task<FaseProducao> CreateAsync(FaseProducaoCreateDto dto);
        Task<FaseProducao?> GetByIdAsync(Guid id);
        Task<IEnumerable<FaseProducao>> GetAllAsync();
        Task<bool> UpdateAsync(FaseProducaoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
