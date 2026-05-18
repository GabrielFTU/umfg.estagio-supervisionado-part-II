using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IUsuarioService
    {
        Task<Usuario> CreateAsync(UsuarioCreateDto dto);
        Task<Usuario?> GetByIdAsync(Guid id);
        Task<Usuario?> GetByEmailAsync(string email);
        Task<IEnumerable<Usuario>> GetAllAsync();
        Task<bool> UpdateAsync(UsuarioUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
