using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IPerfilService
    {
        Task<Perfil> CreateAsync(PerfilCreateDto dto);
        Task<Perfil?> GetByIdAsync(Guid id);
        Task<IEnumerable<Perfil>> GetAllAsync();
        Task<bool> UpdateAsync(PerfilUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
