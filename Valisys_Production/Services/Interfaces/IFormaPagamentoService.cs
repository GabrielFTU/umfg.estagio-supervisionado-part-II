using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IFormaPagamentoService
    {
        Task<FormaPagamento> CreateAsync(FormaPagamentoCreateDto dto);
        Task<FormaPagamento?> GetByIdAsync(Guid id);
        Task<IEnumerable<FormaPagamento>> GetAllAsync();
        Task<bool> UpdateAsync(FormaPagamentoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AdicionarVendedorAsync(Guid formaPagamentoId, Guid vendedorId);
        Task<bool> RemoverVendedorAsync(Guid formaPagamentoId, Guid vendedorId);
    }
}
