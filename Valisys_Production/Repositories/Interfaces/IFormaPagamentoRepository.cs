using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IFormaPagamentoRepository : IRepository<FormaPagamento>
    {
        Task<FormaPagamento?> GetByIdWithVendedoresAsync(Guid id);
        Task<IEnumerable<FormaPagamento>> GetAllWithVendedoresAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> CodigoExisteAsync(int codigo, Guid? ignorarId = null);
        Task<bool> VendedorJaVinculadoAsync(Guid formaPagamentoId, Guid vendedorId);
        Task AdicionarVendedorAsync(FormaPagamentoVendedor vinculo);
        Task<bool> RemoverVendedorAsync(Guid formaPagamentoId, Guid vendedorId);
    }
}
