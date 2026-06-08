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
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public override async Task<IEnumerable<ContaReceber>> GetAllAsync()
            => await _context.ContasReceber
                .Include(c => c.Parcelas)
                .Include(c => c.Pessoa)
                .Include(c => c.PedidoVenda)
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
            DateTime dataPagamento, FormaPagamentoEnum formaPagamento,
            decimal? juros, decimal? multa, string? observacoes)
        {
            var conta = await _context.ContasReceber
                .Include(c => c.Parcelas)
                .FirstOrDefaultAsync(c => c.Id == contaId);

            if (conta is null) return false;

            conta.BaixarParcela(parcelaId, valorPago, dataPagamento, formaPagamento, juros, multa, observacoes);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
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

        public async Task<int> ContarAsync()
            => await _context.ContasReceber.CountAsync();
    }
}
