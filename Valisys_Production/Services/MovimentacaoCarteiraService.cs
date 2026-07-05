using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class MovimentacaoCarteiraService : IMovimentacaoCarteiraService
    {
        private readonly IMovimentacaoCarteiraRepository _repository;

        public MovimentacaoCarteiraService(IMovimentacaoCarteiraRepository repository)
            => _repository = repository;

        public async Task<IEnumerable<MovimentacaoCarteira>> ListarPorCarteiraAsync(Guid carteiraId)
            => await _repository.GetByCarteiraIdAsync(carteiraId);

        public async Task<IEnumerable<MovimentacaoCarteira>> ListarTodasAsync()
            => await _repository.GetAllAsync();
    }
}
