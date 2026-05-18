using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface ICategoriaProdutoService
    {
        Task<CategoriaProduto> CreateAsync(CategoriaProdutoCreateDto dto);
        Task<CategoriaProduto?> GetByIdAsync(Guid id);
        Task<IEnumerable<CategoriaProduto>> GetAllAsync();
        Task<bool> UpdateAsync(CategoriaProdutoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
