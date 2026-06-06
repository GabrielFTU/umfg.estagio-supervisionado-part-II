using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class AlmoxarifadoService : IAlmoxarifadoService
    {
        private readonly IAlmoxarifadoRepository _repository;

        public AlmoxarifadoService(IAlmoxarifadoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Almoxarifado> CreateAsync(AlmoxarifadoCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome do almoxarifado não pode ser vazio.");

            var almoxarifado = new Almoxarifado(dto.Nome, dto.Descricao, dto.Localizacao,
                dto.Responsavel, dto.Contato, dto.Email);

            return await _repository.AddAsync(almoxarifado);
        }

        public async Task<Almoxarifado?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID do Almoxarifado inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Almoxarifado>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(AlmoxarifadoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID do Almoxarifado ausente.");
            if (string.IsNullOrWhiteSpace(dto.Nome)) throw new ArgumentException("O nome não pode ser vazio.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException($"Almoxarifado {dto.Id} não encontrado.");

            existing.Atualizar(dto.Nome, dto.Descricao, dto.Localizacao, dto.Responsavel,
                dto.Contato, dto.Email, dto.Ativo);

            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID do Almoxarifado inválido.");

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            if (await _repository.HasActiveLotesAsync(id))
                throw new InvalidOperationException(
                    $"Não é possível desativar o almoxarifado '{existing.Nome}' pois possui lotes ativos.");

            existing.Desativar();
            return await _repository.UpdateAsync(existing);
        }
    }
}
