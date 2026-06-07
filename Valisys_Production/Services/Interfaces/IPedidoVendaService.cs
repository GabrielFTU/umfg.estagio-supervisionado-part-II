using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Services.Interfaces
{
    public interface IPedidoVendaService
    {
        Task<PedidoVenda> CreateAsync(PedidoVendaCreateDto dto, Guid usuarioId);
        Task<PedidoVenda?> GetByIdAsync(Guid id);
        Task<IEnumerable<PedidoVenda>> GetAllAsync();
        Task<bool> UpdateAsync(PedidoVendaUpdateDto dto, Guid usuarioId);
        Task<bool> AlterarStatusAsync(Guid id, StatusPedido novoStatus, Guid usuarioId);
    }
}
