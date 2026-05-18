using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class UnidadeMedidaService : IUnidadeMedidaService
    {
        private readonly IUnidadeMedidaRepository _repository;
        private readonly ILogSistemaService _logService;

        public UnidadeMedidaService(IUnidadeMedidaRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<UnidadeMedida> CreateAsync(UnidadeMedidaCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Nome) || string.IsNullOrEmpty(dto.Sigla))
                throw new ArgumentException("Nome e sigla da unidade de medida são obrigatórios.");

            var unidade = new UnidadeMedida(dto.Nome, dto.Sigla, dto.Grandeza, dto.FatorConversao, dto.EhUnidadeBase);
            var created = await _repository.AddAsync(unidade);

            await _logService.RegistrarAsync("Criação", "Unidades de Medida",
                $"Criou unidade '{created.Nome}' ({created.Sigla})");

            return created;
        }

        public async Task<UnidadeMedida?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<UnidadeMedida>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(UnidadeMedidaUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");
            if (string.IsNullOrEmpty(dto.Nome) || string.IsNullOrEmpty(dto.Sigla))
                throw new ArgumentException("Nome e sigla são obrigatórios.");

            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null) throw new KeyNotFoundException("Unidade de Medida não encontrada.");

            existing.Atualizar(dto.Nome, dto.Sigla, dto.Grandeza, dto.FatorConversao, dto.EhUnidadeBase, dto.Ativo);
            var updated = await _repository.UpdateAsync(existing);

            if (updated)
                await _logService.RegistrarAsync("Edição", "Unidades de Medida",
                    $"Editou unidade '{existing.Nome}' ({existing.Sigla})");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            var deleted = await _repository.DeleteAsync(id);

            if (deleted)
                await _logService.RegistrarAsync("Exclusão", "Unidades de Medida",
                    $"Excluiu unidade '{existing.Nome}'");

            return deleted;
        }
    }
}
