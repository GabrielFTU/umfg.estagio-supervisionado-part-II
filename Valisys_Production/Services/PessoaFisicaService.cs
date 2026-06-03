using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class PessoaFisicaService : IPessoaFisicaService
    {
        private readonly IPessoaFisicaRepository _repository;
        private readonly ILogSistemaService _logService;

        public PessoaFisicaService(IPessoaFisicaRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<PessoaFisica> CreateAsync(PessoaFisicaCreateDto dto)
        {
            var endereco = dto.Endereco?.ToModel();
            var pessoa = new PessoaFisica(
                dto.Nome, dto.Cpf, dto.PapelPessoa,
                dto.NomeFantasia, dto.Email, dto.Telefone, dto.Celular,
                dto.Rg, dto.OrgaoExpedidor, dto.DataNascimento, dto.Sexo,
                endereco, dto.Observacoes);

            var created = await _repository.AddAsync(pessoa);

            await _logService.RegistrarAsync("Criação", "PessoasFisicas",
                $"Cadastrou a pessoa física '{created.Nome}' (CPF: {created.Cpf})");

            return created;
        }

        public async Task<PessoaFisica?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<PessoaFisica>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(Guid id, PessoaFisicaUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Pessoa física não encontrada.");

            var endereco = dto.Endereco?.ToModel();
            existing.Atualizar(
                dto.Nome, dto.Cpf, dto.PapelPessoa,
                dto.NomeFantasia, dto.Email, dto.Telefone, dto.Celular,
                dto.Rg, dto.OrgaoExpedidor, dto.DataNascimento, dto.Sexo,
                endereco, dto.Observacoes);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "PessoasFisicas",
                    $"Atualizou a pessoa física '{existing.Nome}'");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Desativar();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Inativação", "PessoasFisicas",
                    $"Inativou a pessoa física '{existing.Nome}'");

            return result;
        }

        public async Task<bool> BloquearCreditoAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.BloquearCredito();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Bloqueio", "PessoasFisicas",
                    $"Bloqueou crédito da pessoa física '{existing.Nome}'");

            return result;
        }
    }
}
