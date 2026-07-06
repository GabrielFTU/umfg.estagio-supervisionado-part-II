using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class NotificacaoService : INotificacaoService
    {
        private readonly INotificacaoRepository _repository;

        public NotificacaoService(INotificacaoRepository repository)
        {
            _repository = repository;
        }

        public async Task CriarAsync(string titulo, string mensagem, string tipo, Guid? ordemDeProducaoId = null)
        {
            var notificacao = new Notificacao(titulo, mensagem, tipo, ordemDeProducaoId);
            await _repository.AddAsync(notificacao);
        }

        public async Task<IEnumerable<Notificacao>> GetRecentesAsync() => await _repository.GetRecentesAsync();
    }
}
