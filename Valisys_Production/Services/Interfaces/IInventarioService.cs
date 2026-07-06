using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IInventarioService
    {
        Task<Inventario> CreateAsync(InventarioCreateDto dto, Guid usuarioId);
        Task<Inventario?> GetByIdAsync(Guid id);
        Task<IEnumerable<Inventario>> GetAllAsync();
        Task<bool> UpdateAsync(InventarioUpdateDto dto);
        Task<bool> FinalizarAsync(Guid id);
        Task<bool> CancelarAsync(Guid id);
    }
}
