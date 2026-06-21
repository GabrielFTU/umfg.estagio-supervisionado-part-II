using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface ICondicaoPagamentoRepository
    {
        Task<CondicaoPagamento?> GetByIdAsync(Guid id);
        Task<IEnumerable<CondicaoPagamento>> GetAllAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> NomeExisteAsync(string nome, Guid? ignorarId = null);
        Task AddAsync(CondicaoPagamento condicao);
        Task UpdateWithParcelasAsync(CondicaoPagamento condicao, List<ParcelaCondicao> novasParcelas);
        Task SaveChangesAsync();
    }
}
