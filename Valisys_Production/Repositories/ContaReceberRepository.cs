using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class ContaReceberRepository : Repository<ContaReceber>, IContaReceberRepository
    {
        public ContaReceberRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<ContaReceber?> GetByIdAsync(Guid id)
            => await _context.ContasReceber
                .Include(c => c.Parcelas)
                .Include(c => c.Pessoa)
                .Include(c => c.PedidoVenda)
                .Include(c => c.FormaPagamento)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public override async Task<IEnumerable<ContaReceber>> GetAllAsync()
            => await _context.ContasReceber
                .Include(c => c.Parcelas)
                .Include(c => c.Pessoa)
                .Include(c => c.PedidoVenda)
                .Include(c => c.FormaPagamento)
                .AsNoTracking()
                .OrderByDescending(c => c.DataVencimento)
                .ToListAsync();

        public async Task<bool> ExisteParaPedidoAsync(Guid pedidoVendaId)
            => await _context.ContasReceber
                .AnyAsync(c => c.PedidoVendaId == pedidoVendaId && c.Ativo);

        public async Task<IEnumerable<ContaReceber>> GetByPeriodoAsync(DateTime inicio, DateTime fim)
            => await _context.ContasReceber
                .Include(c => c.Parcelas)
                .AsNoTracking()
                .Where(c => c.DataVencimento >= inicio && c.DataVencimento <= fim)
                .ToListAsync();

        public async Task<bool> BaixarParcelaAsync(Guid contaId, Guid parcelaId, decimal valorPago,
            DateTime dataPagamento, FormaPagamentoEnum formaPagamento, Guid carteiraId,
            decimal? juros, decimal? multa, string? observacoes)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var conta = await _context.ContasReceber
                    .Include(c => c.Parcelas)
                    .FirstOrDefaultAsync(c => c.Id == contaId);

                if (conta is null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                var carteira = await _context.Carteiras.FirstOrDefaultAsync(c => c.Id == carteiraId)
                    ?? throw new KeyNotFoundException("Carteira financeira não encontrada.");

                var parcela = conta.Parcelas.FirstOrDefault(p => p.Id == parcelaId)
                    ?? throw new KeyNotFoundException("Parcela não encontrada.");

                if (parcela.DataPagamento.HasValue)
                    throw new InvalidOperationException("Esta parcela já foi paga.");

                conta.BaixarParcela(parcelaId, valorPago, dataPagamento, formaPagamento, carteiraId, juros, multa, observacoes);
                carteira.Creditar(valorPago);

                var movimentacao = new MovimentacaoCarteira(carteiraId, TipoMovimentacaoCarteira.Credito,
                    OrigemMovimentacaoCarteira.ContaReceber, valorPago, dataPagamento,
                    $"Baixa parcela {parcela.NumeroParcela}/{conta.Parcelas.Count} - {conta.Descricao}",
                    contaReceberId: contaId, parcelaReceberId: parcelaId);
                _context.MovimentacoesCarteira.Add(movimentacao);

                var result = await _context.SaveChangesAsync() > 0;

                if (result)
                    await transaction.CommitAsync();
                else
                    await transaction.RollbackAsync();

                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> EstornarParcelaAsync(Guid contaId, Guid parcelaId)
        {
            var conta = await _context.ContasReceber
                .Include(c => c.Parcelas)
                    .ThenInclude(p => p.Baixas)
                .FirstOrDefaultAsync(c => c.Id == contaId);

            if (conta is null) return false;

            var parcela = conta.Parcelas.FirstOrDefault(p => p.Id == parcelaId)
                ?? throw new KeyNotFoundException("Parcela não encontrada.");

            var baixasRevertidas = conta.EstornarParcela(parcelaId);

            var carteiraIds = baixasRevertidas.Select(b => b.CarteiraId).Distinct().ToList();
            var carteiras = await _context.Carteiras
                .Where(c => carteiraIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id);

            foreach (var baixa in baixasRevertidas)
            {
                if (!carteiras.TryGetValue(baixa.CarteiraId, out var carteira)) continue;

                carteira.Debitar(baixa.ValorPago);

                var movimentacao = new MovimentacaoCarteira(baixa.CarteiraId, TipoMovimentacaoCarteira.Debito,
                    OrigemMovimentacaoCarteira.ContaReceber, baixa.ValorPago, DateTime.UtcNow,
                    $"Estorno baixa parcela {parcela.NumeroParcela}/{conta.Parcelas.Count} - {conta.Descricao}",
                    contaReceberId: contaId, parcelaReceberId: parcelaId);
                _context.MovimentacoesCarteira.Add(movimentacao);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task VerificarVencimentosAsync()
        {
            var contas = await _context.ContasReceber
                .Include(c => c.Parcelas)
                .Where(c => c.Status != StatusConta.Pago && c.Status != StatusConta.Cancelado)
                .ToListAsync();

            foreach (var conta in contas)
                conta.VerificarVencimento();

            await _context.SaveChangesAsync();
        }

        public async Task<string> ProximoCodigoAsync()
        {
            var numero = await _context.Database
                .SqlQueryRaw<long>("SELECT nextval('conta_receber_codigo_seq') AS \"Value\"")
                .FirstAsync();

            return numero.ToString("D8");
        }
    }
}
