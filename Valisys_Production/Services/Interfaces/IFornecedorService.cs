using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IFornecedorService
    {
        Task<Fornecedor> CreateAsync(FornecedorCreateDto dto);
        Task<Fornecedor> GetByIdAsync(Guid id);
        Task<IEnumerable<Fornecedor>> GetAllAsync();
        Task<bool> UpdateAsync(FornecedorUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
