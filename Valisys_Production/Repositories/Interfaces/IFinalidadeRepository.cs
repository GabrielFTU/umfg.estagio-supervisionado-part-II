using Valisys_Production.Models;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IFinalidadeRepository
    {
        Task<Finalidade?> GetByIdAsync(Guid id);
        Task<IEnumerable<Finalidade>> GetAllAsync();
        Task<int> GetProximoCodigoAsync();
        Task<bool> NomeExisteAsync(string nome, Guid? ignorarId = null);
        Task AddAsync(Finalidade finalidade);
        void Update(Finalidade finalidade);
        Task SaveChangesAsync();
    }
}
