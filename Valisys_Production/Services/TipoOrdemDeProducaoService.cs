using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class TipoOrdemDeProducaoService : ITipoOrdemDeProducaoService
    {
        private readonly ITipoOrdemDeProducaoRepository _repository;
        private readonly ILogSistemaService _logService;

        public TipoOrdemDeProducaoService(ITipoOrdemDeProducaoRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<TipoOrdemDeProducao> CreateAsync(TipoOrdemDeProducaoCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome do tipo de ordem de produção é obrigatório.");

            var tipo = new TipoOrdemDeProducao(dto.Nome, dto.Codigo, dto.Descricao);
            var created = await _repository.AddAsync(tipo);

            await _logService.RegistrarAsync("Criação", "Tipos de OP",
                $"Criou o tipo de OP '{created.Nome}'");

            return created;
        }

        public async Task<TipoOrdemDeProducao?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<TipoOrdemDeProducao>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(TipoOrdemDeProducaoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Tipo de OP não encontrado.");

            existing.Atualizar(dto.Nome, dto.Codigo, dto.Descricao, dto.Ativo);
            var updated = await _repository.UpdateAsync(existing);

            if (updated)
                await _logService.RegistrarAsync("Edição", "Tipos de OP",
                    $"Editou o tipo de OP '{existing.Nome}'");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Desativar();
            var deleted = await _repository.UpdateAsync(existing);

            if (deleted)
                await _logService.RegistrarAsync("Inativação", "Tipos de OP",
                    $"Inativou o tipo de OP '{existing.Nome}'");

            return deleted;
        }
    }
}
