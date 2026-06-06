using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IDepositoService
    {
        Task<Deposito> CreateAsync(DepositoCreateDto dto);
        Task<Deposito?> GetByIdAsync(Guid id);
        Task<IEnumerable<Deposito>> GetAllAsync();
        Task<bool> UpdateAsync(DepositoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
