using Valisys_Production.DTOs;

namespace Valisys_Production.Services.Interfaces
{
    public interface IFinalidadeService
    {
        Task<FinalidadeReadDto> CreateAsync(FinalidadeCreateDto dto);
        Task<FinalidadeReadDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<FinalidadeReadDto>> GetAllAsync();
        Task<FinalidadeReadDto> UpdateAsync(FinalidadeUpdateDto dto);
        Task DeleteAsync(Guid id);
    }
}
