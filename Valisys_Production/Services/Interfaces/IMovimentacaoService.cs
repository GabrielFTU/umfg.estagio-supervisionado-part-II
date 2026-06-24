using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IMovimentacaoService
    {
        Task<IEnumerable<Movimentacao>> CreateLoteAsync(MovimentacaoLoteCreateDto dto, Guid usuarioId);
        Task<Movimentacao?> GetByIdAsync(Guid id);
        Task<IEnumerable<Movimentacao>> GetAllAsync();
        Task<bool> DeleteAsync(Guid id);
    }
}
