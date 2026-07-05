using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IMovimentacaoCarteiraService
    {
        Task<IEnumerable<MovimentacaoCarteira>> ListarPorCarteiraAsync(Guid carteiraId);
        Task<IEnumerable<MovimentacaoCarteira>> ListarTodasAsync();
    }
}
