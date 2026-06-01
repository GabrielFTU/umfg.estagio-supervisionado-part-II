using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IFichaTecnicaRepository : IRepository<FichaTecnica>
    {
        Task<bool> UpdateWithItemsAsync(FichaTecnica ficha, List<FichaTecnicaItem> novosItens);
        Task<string?> GetUltimoCodigoAsync();
    }
}
