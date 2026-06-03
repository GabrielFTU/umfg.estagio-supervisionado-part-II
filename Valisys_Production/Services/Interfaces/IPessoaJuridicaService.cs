using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IPessoaJuridicaService
    {
        Task<PessoaJuridica> CreateAsync(PessoaJuridicaCreateDto dto);
        Task<PessoaJuridica?> GetByIdAsync(Guid id);
        Task<IEnumerable<PessoaJuridica>> GetAllAsync();
        Task<bool> UpdateAsync(Guid id, PessoaJuridicaUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> BloquearCreditoAsync(Guid id);
    }
}
