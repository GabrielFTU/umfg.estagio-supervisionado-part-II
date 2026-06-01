using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class LoteService : ILoteService
    {
        private readonly ILoteRepository _repository;
        private readonly ILogSistemaService _logService;

        public LoteService(ILoteRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<Lote> CreateAsync(LoteCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CodigoLote))
                throw new ArgumentException("Código do lote obrigatório.");

            var lote = new Lote(dto.CodigoLote, dto.ProdutoId, dto.AlmoxarifadoId,
                dto.Descricao, dto.Observacoes);

            var created = await _repository.AddAsync(lote);

            await _logService.RegistrarAsync("Criação", "Lotes",
                $"Registrou novo Lote: {created.CodigoLote}");

            return created;
        }

        public async Task<Lote?> GetByIdAsync(Guid id) => await _repository.GetByIdAsync(id);
        public async Task<IEnumerable<Lote>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(LoteUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Lote não encontrado.");

            existing.Atualizar(dto.CodigoLote, dto.DataAbertura, dto.DataConclusao, dto.Ativo);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "Lotes",
                    $"Atualizou dados do Lote: {existing.CodigoLote}");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Cancelar();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Cancelamento", "Lotes",
                    $"Cancelou o Lote: {existing.CodigoLote}");

            return result;
        }
    }
}
