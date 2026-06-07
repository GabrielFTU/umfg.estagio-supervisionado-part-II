using Valisys_Production.DTOs;

namespace Valisys_Production.Services.Interfaces
{
    public interface ICondicaoPagamentoService
    {
        Task<CondicaoPagamentoReadDto> CreateAsync(CondicaoPagamentoCreateDto dto);
        Task<CondicaoPagamentoReadDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<CondicaoPagamentoReadDto>> GetAllAsync();
        Task<CondicaoPagamentoReadDto> UpdateAsync(CondicaoPagamentoUpdateDto dto);
        Task DeleteAsync(Guid id);
    }
}
