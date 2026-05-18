using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IProdutoService
    {
        Task<Produto> CreateAsync(ProdutoCreateDto dto);
        Task<Produto?> GetByIdAsync(Guid id);
        Task<IEnumerable<Produto>> GetAllAsync();
        Task<bool> UpdateAsync(ProdutoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
