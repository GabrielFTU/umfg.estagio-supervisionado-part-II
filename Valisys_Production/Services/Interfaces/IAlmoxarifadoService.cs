using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IAlmoxarifadoService
    {
        Task<Almoxarifado> CreateAsync(AlmoxarifadoCreateDto dto);
        Task<Almoxarifado> GetByIdAsync(Guid id);
        Task<IEnumerable<Almoxarifado>> GetAllAsync();
        Task<bool> UpdateAsync(AlmoxarifadoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
