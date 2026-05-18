using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface ISolicitacaoProducaoService
    {
        Task<SolicitacaoProducao> CreateAsync(SolicitacaoProducaoCreateDto dto);
        Task<SolicitacaoProducao?> GetByIdAsync(Guid id);
        Task<IEnumerable<SolicitacaoProducao>> GetAllAsync();
        Task<bool> UpdateAsync(SolicitacaoProducaoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<List<OrdemDeProducao>> AprovarSolicitacaoAsync(Guid solicitacaoId, Guid usuarioAprovadorId);
    }
}
