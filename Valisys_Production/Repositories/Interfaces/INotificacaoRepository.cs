using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface INotificacaoRepository
    {
        Task AddAsync(Notificacao notificacao);
        Task<IEnumerable<Notificacao>> GetRecentesAsync(int take = 30);
    }
}
