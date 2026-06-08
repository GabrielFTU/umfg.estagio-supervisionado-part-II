using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class DepositoService : IDepositoService
    {
        private readonly IDepositoRepository _repository;

        public DepositoService(IDepositoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Deposito> CreateAsync(DepositoCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome do depósito não pode ser vazio.");
            if (dto.AlmoxarifadoId == Guid.Empty)
                throw new ArgumentException("O almoxarifado é obrigatório.");

            var deposito = new Deposito(dto.AlmoxarifadoId, dto.CodigoIdentificador, dto.Nome, dto.Descricao,
                dto.DepositoPadraoRequisicoes, dto.ControlaQualidade2a, dto.ControlaLote, dto.ControlaMultiplosLocais);
            return await _repository.AddAsync(deposito);
        }

        public async Task<Deposito?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID do depósito inválido.");
            return await _repository.GetByIdWithAlmoxarifadoAsync(id);
        }

        public async Task<IEnumerable<Deposito>> GetAllAsync()
            => await _repository.GetAllWithAlmoxarifadoAsync();

        public async Task<bool> UpdateAsync(DepositoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID do depósito ausente.");
            if (string.IsNullOrWhiteSpace(dto.Nome)) throw new ArgumentException("O nome não pode ser vazio.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException($"Depósito {dto.Id} não encontrado.");

            existing.Atualizar(dto.Nome, dto.CodigoIdentificador, dto.Descricao,
                dto.DepositoPadraoRequisicoes, dto.ControlaQualidade2a, dto.ControlaLote, dto.ControlaMultiplosLocais);

            if (!dto.Ativo && existing.Ativo)
            {
                if (await _repository.HasActiveLotesInAlmoxarifadoAsync(existing.AlmoxarifadoId))
                    throw new InvalidOperationException(
                        $"Não é possível desativar o depósito '{existing.Nome}' pois o almoxarifado possui lotes ativos.");
                existing.Desativar();
            }
            else if (dto.Ativo && !existing.Ativo)
            {
                existing.Ativar();
            }

            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID do depósito inválido.");

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            if (await _repository.HasActiveLotesInAlmoxarifadoAsync(existing.AlmoxarifadoId))
                throw new InvalidOperationException(
                    $"Não é possível desativar o depósito '{existing.Nome}' pois o almoxarifado possui lotes ativos.");

            existing.Desativar();
            return await _repository.UpdateAsync(existing);
        }
    }
}
