using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class FornecedorService : IFornecedorService
    {
        private readonly IFornecedorRepository _repository;
        private readonly ILogSistemaService _logService;

        public FornecedorService(IFornecedorRepository fornecedorRepository, ILogSistemaService logService)
        {
            _repository = fornecedorRepository;
            _logService = logService;
        }

        public async Task<Fornecedor> CreateAsync(FornecedorCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Nome))
                throw new ArgumentException("Nome do fornecedor não pode estar vazio.");

            var fornecedor = new Fornecedor(dto.Nome, dto.Documento, dto.TipoDocumento, dto.Email, dto.Telefone);
            var created = await _repository.AddAsync(fornecedor);

            await _logService.RegistrarAsync("Criação", "Fornecedores",
                $"Cadastrou o fornecedor '{created.Nome}' (Doc: {created.Documento})");

            return created;
        }

        public async Task<Fornecedor?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Fornecedor>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(FornecedorUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null) throw new KeyNotFoundException("Fornecedor não encontrado.");

            existing.Atualizar(dto.Nome, dto.Documento, dto.TipoDocumento, dto.Endereco,
                dto.Email, dto.Telefone, dto.Observacoes, null, null, null, dto.Ativo);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "Fornecedores",
                    $"Atualizou dados do fornecedor '{existing.Nome}'");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            var result = await _repository.DeleteAsync(id);

            if (result)
                await _logService.RegistrarAsync("Exclusão", "Fornecedores",
                    $"Excluiu/Inativou o fornecedor '{existing.Nome}'");

            return result;
        }
    }
}
