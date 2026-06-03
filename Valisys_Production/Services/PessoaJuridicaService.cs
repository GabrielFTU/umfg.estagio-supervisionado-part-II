using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class PessoaJuridicaService : IPessoaJuridicaService
    {
        private readonly IPessoaJuridicaRepository _repository;
        private readonly ILogSistemaService _logService;

        public PessoaJuridicaService(IPessoaJuridicaRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<PessoaJuridica> CreateAsync(PessoaJuridicaCreateDto dto)
        {
            var endereco = dto.Endereco?.ToModel();
            var pessoa = new PessoaJuridica(
                dto.RazaoSocial, dto.Cnpj, dto.PapelPessoa,
                dto.NomeFantasia, dto.Email, dto.Telefone, dto.Celular,
                dto.InscricaoEstadual, dto.InscricaoMunicipal,
                dto.ResponsavelNome, dto.ResponsavelCpf,
                endereco, dto.Observacoes);

            var created = await _repository.AddAsync(pessoa);

            await _logService.RegistrarAsync("Criação", "PessoasJuridicas",
                $"Cadastrou a pessoa jurídica '{created.Nome}' (CNPJ: {created.Cnpj})");

            return created;
        }

        public async Task<PessoaJuridica?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<PessoaJuridica>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(Guid id, PessoaJuridicaUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Pessoa jurídica não encontrada.");

            var endereco = dto.Endereco?.ToModel();
            existing.Atualizar(
                dto.RazaoSocial, dto.Cnpj, dto.PapelPessoa,
                dto.NomeFantasia, dto.Email, dto.Telefone, dto.Celular,
                dto.InscricaoEstadual, dto.InscricaoMunicipal,
                dto.ResponsavelNome, dto.ResponsavelCpf,
                endereco, dto.Observacoes);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "PessoasJuridicas",
                    $"Atualizou a pessoa jurídica '{existing.Nome}'");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Desativar();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Inativação", "PessoasJuridicas",
                    $"Inativou a pessoa jurídica '{existing.Nome}'");

            return result;
        }

        public async Task<bool> BloquearCreditoAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.BloquearCredito();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Bloqueio", "PessoasJuridicas",
                    $"Bloqueou crédito da pessoa jurídica '{existing.Nome}'");

            return result;
        }
    }
}
