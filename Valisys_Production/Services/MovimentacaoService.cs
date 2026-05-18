using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class MovimentacaoService : IMovimentacaoService
    {
        private readonly IMovimentacaoRepository _repository;

        public MovimentacaoService(IMovimentacaoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Movimentacao> CreateAsync(MovimentacaoCreateDto dto, Guid usuarioId)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "O objeto DTO não pode ser nulo.");
            if (usuarioId == Guid.Empty)
                throw new ArgumentException("O ID do usuário é obrigatório.", nameof(usuarioId));

            var movimentacao = new Movimentacao(
                dto.ProdutoId, dto.Quantidade,
                dto.AlmoxarifadoOrigemId, dto.AlmoxarifadoDestinoId,
                usuarioId, DateTime.UtcNow, null, dto.OrdemDeProducaoId);

            return await _repository.AddAsync(movimentacao);
        }

        public async Task<Movimentacao?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("ID da movimentação inválido.", nameof(id));
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Movimentacao>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(MovimentacaoUpdateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (dto.Id == Guid.Empty)
                throw new ArgumentException("ID da movimentação é obrigatório.", nameof(dto.Id));

            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null)
                throw new KeyNotFoundException($"Movimentação com ID {dto.Id} não encontrada.");

            existing.Atualizar(dto.Quantidade, dto.AlmoxarifadoOrigemId,
                dto.AlmoxarifadoDestinoId, dto.Observacoes);

            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("ID da movimentação inválido.", nameof(id));

            var success = await _repository.DeleteAsync(id);
            if (!success)
                throw new KeyNotFoundException($"Movimentação com ID {id} não encontrada.");

            return true;
        }
    }
}
