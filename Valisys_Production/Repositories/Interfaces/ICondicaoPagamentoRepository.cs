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
        void Update(CondicaoPagamento condicao);
        void RemoveParcelas(IEnumerable<ParcelaCondicao> parcelas);
        Task SaveChangesAsync();
    }
}
