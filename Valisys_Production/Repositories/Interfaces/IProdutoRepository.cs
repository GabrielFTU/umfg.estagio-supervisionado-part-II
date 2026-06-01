using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IProdutoRepository : IRepository<Produto>
    {
        Task<int?> GetUltimoCodigoAsync();
    }
}
