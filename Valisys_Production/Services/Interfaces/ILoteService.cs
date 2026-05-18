using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface ILoteService
    {
        Task<Lote> CreateAsync(LoteCreateDto dto);
        Task<Lote?> GetByIdAsync(Guid id);
        Task<IEnumerable<Lote>> GetAllAsync();
        Task<bool> UpdateAsync(LoteUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
