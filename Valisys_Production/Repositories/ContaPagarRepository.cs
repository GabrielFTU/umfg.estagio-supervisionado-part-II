using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class ContaPagarRepository : Repository<ContaPagar>, IContaPagarRepository
    {
        public ContaPagarRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<ContaPagar?> GetByIdAsync(Guid id)
            => await _context.ContasPagar
                .Include(c => c.Parcelas)
                .Include(c => c.Fornecedor)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public override async Task<IEnumerable<ContaPagar>> GetAllAsync()
            => await _context.ContasPagar
                .Include(c => c.Parcelas)
                .Include(c => c.Fornecedor)
                .AsNoTracking()
                .OrderByDescending(c => c.DataVencimento)
                .ToListAsync();

        public async Task<IEnumerable<ContaPagar>> GetByPeriodoAsync(DateTime inicio, DateTime fim)
            => await _context.ContasPagar
                .Include(c => c.Parcelas)
                .Include(c => c.Fornecedor)
                .AsNoTracking()
                .Where(c => c.DataVencimento >= inicio && c.DataVencimento <= fim)
                .ToListAsync();

        public async Task<bool> BaixarParcelaAsync(Guid contaId, Guid parcelaId, decimal valorPago,
            DateTime dataPagamento, FormaPagamentoEnum formaPagamento,
            decimal? juros, decimal? multa, string? observacoes)
        {
            var conta = await _context.ContasPagar
                .Include(c => c.Parcelas)
                .FirstOrDefaultAsync(c => c.Id == contaId);

            if (conta is null) return false;

            conta.BaixarParcela(parcelaId, valorPago, dataPagamento, formaPagamento, juros, multa, observacoes);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }

        public async Task<bool> EstornarParcelaAsync(Guid contaId, Guid parcelaId)
        {
            var conta = await _context.ContasPagar
                .Include(c => c.Parcelas)
                .FirstOrDefaultAsync(c => c.Id == contaId);

            if (conta is null) return false;

            conta.EstornarParcela(parcelaId);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }

        public async Task VerificarVencimentosAsync()
        {
            var contas = await _context.ContasPagar
                .Include(c => c.Parcelas)
                .Where(c => c.Status != StatusConta.Pago && c.Status != StatusConta.Cancelado)
                .ToListAsync();

            foreach (var conta in contas)
                conta.VerificarVencimento();

            await _context.SaveChangesAsync();
        }

        public async Task<int> ContarAsync()
            => await _context.ContasPagar.CountAsync();
    }
}
