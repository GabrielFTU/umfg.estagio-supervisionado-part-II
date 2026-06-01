using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class PerfilService : IPerfilService
    {
        private readonly IPerfilRepository _repository;

        public PerfilService(IPerfilRepository repository)
        {
            _repository = repository;
        }

        public async Task<Perfil> CreateAsync(PerfilCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome do perfil não pode ser vazio.");

            var perfil = new Perfil(dto.Nome, dto.Acessos);
            return await _repository.AddAsync(perfil);
        }

        public async Task<Perfil?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID do Perfil inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Perfil>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(PerfilUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID do Perfil ausente.");
            if (string.IsNullOrWhiteSpace(dto.Nome)) throw new ArgumentException("O nome do perfil não pode ser vazio.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException($"Perfil {dto.Id} não encontrado.");

            existing.Atualizar(dto.Nome, dto.Ativo);
            existing.AtualizarAcessos(dto.Acessos);
            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID do Perfil inválido.");

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Desativar();
            return await _repository.UpdateAsync(existing);
        }
    }
}
