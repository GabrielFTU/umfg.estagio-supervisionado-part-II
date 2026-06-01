using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class FaseProducaoService : IFaseProducaoService
    {
        private readonly IFaseProducaoRepository _repository;
        private readonly ILogSistemaService _logService;

        public FaseProducaoService(IFaseProducaoRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<FaseProducao> CreateAsync(FaseProducaoCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome da fase de produção é obrigatório.");

            var fase = new FaseProducao(dto.Nome, dto.Ordem, dto.Descricao, dto.TempoPadraoDias);
            var created = await _repository.AddAsync(fase);

            await _logService.RegistrarAsync("Criação", "Fases de Produção",
                $"Criou a fase '{created.Nome}' (Ordem: {created.Ordem})");

            return created;
        }

        public async Task<FaseProducao?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<FaseProducao>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(FaseProducaoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Fase de Produção não encontrada.");

            existing.Atualizar(dto.Nome, dto.Ordem, dto.Descricao, dto.TempoPadraoDias, dto.Ativo);
            var updated = await _repository.UpdateAsync(existing);

            if (updated)
                await _logService.RegistrarAsync("Edição", "Fases de Produção",
                    $"Editou a fase '{existing.Nome}'");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Desativar();
            var deleted = await _repository.UpdateAsync(existing);

            if (deleted)
                await _logService.RegistrarAsync("Inativação", "Fases de Produção",
                    $"Inativou a fase '{existing.Nome}'");

            return deleted;
        }
    }
}
