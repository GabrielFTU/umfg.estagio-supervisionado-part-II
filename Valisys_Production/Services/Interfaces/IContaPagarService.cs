using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IContaPagarService
    {
        Task<ContaPagar> CreateAsync(ContaPagarCreateDto dto);
        Task<ContaPagar?> GetByIdAsync(Guid id);
        Task<IEnumerable<ContaPagar>> GetAllAsync();
        Task<IEnumerable<ContaPagar>> GetByPeriodoAsync(DateTime inicio, DateTime fim);
        Task<bool> UpdateAsync(ContaPagarUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> BaixarParcelaAsync(ParcelaBaixaDto dto);
        Task VerificarVencimentosAsync();
    }
}
