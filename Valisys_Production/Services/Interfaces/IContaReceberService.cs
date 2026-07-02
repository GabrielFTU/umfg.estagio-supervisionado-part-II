using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IContaReceberService
    {
        Task<ContaReceber> CreateAsync(ContaReceberCreateDto dto);
        Task<ContaReceber?> GetByIdAsync(Guid id);
        Task<IEnumerable<ContaReceber>> GetAllAsync();
        Task<IEnumerable<ContaReceber>> GetByPeriodoAsync(DateTime inicio, DateTime fim);
        Task<bool> UpdateAsync(ContaReceberUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> BaixarParcelaAsync(ParcelaBaixaDto dto);
        Task<bool> EstornarParcelaAsync(ParcelaEstornoDto dto);
        Task VerificarVencimentosAsync();
        Task<bool> ExisteParaPedidoAsync(Guid pedidoVendaId);
    }
}
