using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IFichaTecnicaService
    {
        Task<FichaTecnica> CreateAsync(FichaTecnicaCreateDto dto);
        Task<FichaTecnica?> GetByIdAsync(Guid id);
        Task<IEnumerable<FichaTecnica>> GetAllAsync();
        Task<IEnumerable<FichaTecnica>> GetByProdutoIdAsync(Guid produtoId);
        Task<IEnumerable<Produto>> GetProdutosSemFichaAsync();
        Task<string> ObterProximoCodigoAsync();
        Task<bool> DeleteAsync(Guid id);
        Task<bool> UpdateAsync(FichaTecnicaUpdateDto dto);
    }
}
