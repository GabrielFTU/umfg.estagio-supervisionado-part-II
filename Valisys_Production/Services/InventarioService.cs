using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class InventarioService : IInventarioService
    {
        private readonly IInventarioRepository _repository;
        private readonly IDepositoRepository _depositoRepository;
        private readonly IMovimentacaoRepository _movimentacaoRepository;
        private readonly ApplicationDbContext _context;
        private readonly ILogSistemaService _log;

        public InventarioService(IInventarioRepository repository, IDepositoRepository depositoRepository,
            IMovimentacaoRepository movimentacaoRepository, ApplicationDbContext context, ILogSistemaService log)
        {
            _repository = repository;
            _depositoRepository = depositoRepository;
            _movimentacaoRepository = movimentacaoRepository;
            _context = context;
            _log = log;
        }

        public async Task<Inventario> CreateAsync(InventarioCreateDto dto, Guid usuarioId)
        {
            if (dto.Itens is null || dto.Itens.Count == 0)
                throw new ArgumentException("Adicione ao menos um produto.");

            var deposito = await _depositoRepository.GetByIdAsync(dto.DepositoId)
                ?? throw new ArgumentException("Depósito não encontrado.");

            if (!Enum.TryParse<TipoContagemInventario>(dto.TipoContagem, true, out var tipo))
                throw new ArgumentException("Tipo de contagem inválido.");

            var numero = await _repository.GetProximoNumeroAsync();
            var inventario = new Inventario(numero, deposito.Id, tipo, usuarioId, dto.Observacao);

            foreach (var item in dto.Itens)
                inventario.AdicionarItem(item.ProdutoId, item.QuantidadeContada);

            var criado = await _repository.AddAsync(inventario);

            await _log.RegistrarAsync("Criação", "Inventario",
                $"Abriu o inventário #{numero} do depósito '{deposito.Nome}'.");

            return criado;
        }

        public async Task<Inventario?> GetByIdAsync(Guid id)
            => await _repository.GetByIdWithItensAsync(id);

        public async Task<IEnumerable<Inventario>> GetAllAsync()
            => await _repository.GetAllWithDepositoAsync();

        public async Task<bool> UpdateAsync(InventarioUpdateDto dto)
        {
            if (dto.Id == Guid.Empty)
                throw new ArgumentException("ID ausente.");

            var existente = await _repository.GetByIdWithItensAsync(dto.Id)
                ?? throw new KeyNotFoundException("Inventário não encontrado.");

            if (dto.Itens is null || dto.Itens.Count == 0)
                throw new ArgumentException("Adicione ao menos um produto.");

            if (!Enum.TryParse<TipoContagemInventario>(dto.TipoContagem, true, out var tipo))
                throw new ArgumentException("Tipo de contagem inválido.");

            existente.Atualizar(dto.DepositoId, tipo, dto.Observacao);

            var novosItens = dto.Itens
                .Select(i => new ItemInventario(existente.Id, i.ProdutoId, i.QuantidadeContada))
                .ToList();

            var ok = await _repository.UpdateWithItensAsync(existente, novosItens);

            if (ok)
                await _log.RegistrarAsync("Edição", "Inventario", $"Editou o inventário #{existente.Numero}.");

            return ok;
        }

        public async Task<bool> FinalizarAsync(Guid id, Guid usuarioId)
        {
            var existente = await _repository.GetByIdWithItensAsync(id);
            if (existente is null) return false;

            var deposito = await _depositoRepository.GetByIdAsync(existente.DepositoId)
                ?? throw new InvalidOperationException("Depósito do inventário não encontrado.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                existente.Finalizar();
                await GerarAjustesDeEstoqueAsync(existente, deposito, usuarioId);

                var ok = await _repository.UpdateAsync(existente);
                await transaction.CommitAsync();

                if (ok)
                    await _log.RegistrarAsync("Finalização", "Inventario", $"Finalizou o inventário #{existente.Numero}.");

                return ok;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Gera movimentações de ajuste (Entrada/Saída) pela diferença entre a quantidade
        // contada no inventário e o saldo calculado (soma de Movimentacoes) do depósito.
        private async Task GerarAjustesDeEstoqueAsync(Inventario inventario, Deposito deposito, Guid usuarioId)
        {
            var produtoIds = inventario.Itens.Select(i => i.ProdutoId).Distinct().ToList();

            var movs = await _context.Movimentacoes.AsNoTracking()
                .Where(m => produtoIds.Contains(m.ProdutoId) &&
                    (m.DepositoDestinoId == inventario.DepositoId || m.DepositoOrigemId == inventario.DepositoId))
                .ToListAsync();

            foreach (var item in inventario.Itens)
            {
                var entrada = movs.Where(m => m.ProdutoId == item.ProdutoId && m.DepositoDestinoId == inventario.DepositoId).Sum(m => m.Quantidade);
                var saida = movs.Where(m => m.ProdutoId == item.ProdutoId && m.DepositoOrigemId == inventario.DepositoId).Sum(m => m.Quantidade);
                var saldoAtual = entrada - saida;
                var diferenca = item.QuantidadeContada - saldoAtual;

                if (diferenca == 0) continue;

                var justificativa = $"Ajuste de Inventário #{inventario.Numero} (contado: {item.QuantidadeContada}, saldo anterior: {saldoAtual})";

                var mov = diferenca > 0
                    ? new Movimentacao(item.ProdutoId, diferenca, justificativa,
                        null, null, deposito.AlmoxarifadoId, deposito.Id, usuarioId)
                    : new Movimentacao(item.ProdutoId, -diferenca, justificativa,
                        deposito.AlmoxarifadoId, deposito.Id, null, null, usuarioId);

                await _movimentacaoRepository.AddAsync(mov);
            }
        }

        public async Task<bool> CancelarAsync(Guid id)
        {
            var existente = await _repository.GetByIdWithItensAsync(id);
            if (existente is null) return false;

            existente.Cancelar();
            var ok = await _repository.UpdateAsync(existente);

            if (ok)
                await _log.RegistrarAsync("Cancelamento", "Inventario", $"Cancelou o inventário #{existente.Numero}.");

            return ok;
        }
    }
}
