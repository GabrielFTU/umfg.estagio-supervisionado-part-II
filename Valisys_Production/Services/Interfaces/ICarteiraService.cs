using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface ICarteiraService
    {
        Task<Carteira> CreateAsync(CarteiraCreateDto dto);
        Task<Carteira?> GetByIdAsync(Guid id);
        Task<IEnumerable<Carteira>> GetAllAsync();
        Task<bool> UpdateAsync(CarteiraUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AtivarAsync(Guid id);
    }
}
