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

        public async Task<IEnumerable<Movimentacao>> CreateLoteAsync(MovimentacaoLoteCreateDto dto, Guid usuarioId)
        {
            if (dto is null)
                throw new ArgumentNullException(nameof(dto));
            if (usuarioId == Guid.Empty)
                throw new ArgumentException("Usuário inválido.", nameof(usuarioId));
            if (string.IsNullOrWhiteSpace(dto.Justificativa))
                throw new ArgumentException("A justificativa é obrigatória.");
            if (dto.Itens is null || dto.Itens.Count == 0)
                throw new ArgumentException("Adicione ao menos um produto.");
            if (dto.AlmoxarifadoOrigemId is null && dto.AlmoxarifadoDestinoId is null)
                throw new ArgumentException("Informe ao menos a origem ou o destino da movimentação.");
            if (dto.DepositoOrigemId.HasValue && dto.DepositoDestinoId.HasValue
                && dto.DepositoOrigemId == dto.DepositoDestinoId)
                throw new ArgumentException("O depósito de origem e destino não podem ser o mesmo.");

            var resultado = new List<Movimentacao>();

            foreach (var item in dto.Itens)
            {
                var mov = new Movimentacao(
                    item.ProdutoId,
                    item.Quantidade,
                    dto.Justificativa,
                    dto.AlmoxarifadoOrigemId,
                    dto.DepositoOrigemId,
                    dto.AlmoxarifadoDestinoId,
                    dto.DepositoDestinoId,
                    usuarioId,
                    dto.OrdemDeProducaoId,
                    dto.PedidoVendaId);

                resultado.Add(await _repository.AddAsync(mov));
            }

            return resultado;
        }

        public async Task<Movimentacao?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("ID inválido.", nameof(id));
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Movimentacao>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("ID inválido.", nameof(id));
            var ok = await _repository.DeleteAsync(id);
            if (!ok) throw new KeyNotFoundException($"Movimentação '{id}' não encontrada.");
            return true;
        }
    }
}
