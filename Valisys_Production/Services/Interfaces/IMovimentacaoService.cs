using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IMovimentacaoService
    {
        Task<Movimentacao> CreateAsync(MovimentacaoCreateDto dto, Guid usuarioId);
        Task<Movimentacao?> GetByIdAsync(Guid id);
        Task<IEnumerable<Movimentacao>> GetAllAsync();
        Task<bool> UpdateAsync(MovimentacaoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
