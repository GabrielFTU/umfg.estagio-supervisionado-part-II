using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IUnidadeMedidaService
    {
        Task<UnidadeMedida> CreateAsync(UnidadeMedidaCreateDto dto);
        Task<UnidadeMedida?> GetByIdAsync(Guid id);
        Task<IEnumerable<UnidadeMedida>> GetAllAsync();
        Task<bool> UpdateAsync(UnidadeMedidaUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
