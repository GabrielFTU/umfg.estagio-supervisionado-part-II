using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IPedidoVendaRepository : IRepository<PedidoVenda>
    {
        Task<PedidoVenda?> GetByIdWithItensAsync(Guid id);
        Task<IEnumerable<PedidoVenda>> GetAllWithClienteAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> UpdateWithItensAsync(PedidoVenda pedido, List<ItemPedido> novosItens);
    }
}
