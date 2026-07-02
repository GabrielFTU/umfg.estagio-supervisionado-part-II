using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IMovimentacaoCarteiraRepository
    {
        Task<IEnumerable<MovimentacaoCarteira>> GetByCarteiraIdAsync(Guid carteiraId);
    }
}
