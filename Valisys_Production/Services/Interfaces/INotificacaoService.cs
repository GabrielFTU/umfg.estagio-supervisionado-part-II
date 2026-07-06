using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface INotificacaoService
    {
        Task CriarAsync(string titulo, string mensagem, string tipo, Guid? ordemDeProducaoId = null);
        Task<IEnumerable<Notificacao>> GetRecentesAsync();
    }
}
