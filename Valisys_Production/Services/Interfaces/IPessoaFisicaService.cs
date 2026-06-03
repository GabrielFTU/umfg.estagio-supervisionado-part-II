using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IPessoaFisicaService
    {
        Task<PessoaFisica> CreateAsync(PessoaFisicaCreateDto dto);
        Task<PessoaFisica?> GetByIdAsync(Guid id);
        Task<IEnumerable<PessoaFisica>> GetAllAsync();
        Task<bool> UpdateAsync(Guid id, PessoaFisicaUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> BloquearCreditoAsync(Guid id);
    }
}
