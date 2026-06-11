using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Services.Interfaces
{
    public interface IOrcamentoService
    {
        Task<Orcamento> CreateAsync(OrcamentoCreateDto dto, Guid usuarioId);
        Task<Orcamento?> GetByIdAsync(Guid id);
        Task<IEnumerable<Orcamento>> GetAllAsync();
        Task<bool> UpdateAsync(OrcamentoUpdateDto dto, Guid usuarioId);
        Task<bool> AlterarStatusAsync(Guid id, StatusOrcamento novoStatus, Guid usuarioId);
        Task<ConverterEmPedidoResultDto> ConverterEmPedidoAsync(Guid id, Guid usuarioId);
    }
}
