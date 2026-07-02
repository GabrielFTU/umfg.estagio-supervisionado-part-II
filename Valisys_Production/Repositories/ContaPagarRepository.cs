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
                .Include(c => c.FormaPagamento)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public override async Task<IEnumerable<ContaPagar>> GetAllAsync()
            => await _context.ContasPagar
                .Include(c => c.Parcelas)
                .Include(c => c.Fornecedor)
                .Include(c => c.FormaPagamento)
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
            DateTime dataPagamento, FormaPagamentoEnum formaPagamento, Guid carteiraId,
            decimal? juros, decimal? multa, string? observacoes)
        {
            var conta = await _context.ContasPagar
                .Include(c => c.Parcelas)
                .FirstOrDefaultAsync(c => c.Id == contaId);

            if (conta is null) return false;

            var carteira = await _context.Carteiras.FirstOrDefaultAsync(c => c.Id == carteiraId)
                ?? throw new KeyNotFoundException("Carteira financeira não encontrada.");

            var parcela = conta.Parcelas.FirstOrDefault(p => p.Id == parcelaId)
                ?? throw new KeyNotFoundException("Parcela não encontrada.");

            conta.BaixarParcela(parcelaId, valorPago, dataPagamento, formaPagamento, carteiraId, juros, multa, observacoes);
            carteira.Debitar(valorPago);

            var movimentacao = new MovimentacaoCarteira(carteiraId, TipoMovimentacaoCarteira.Debito,
                OrigemMovimentacaoCarteira.ContaPagar, valorPago, dataPagamento,
                $"Baixa parcela {parcela.NumeroParcela}/{conta.Parcelas.Count} - {conta.Descricao}",
                contaPagarId: contaId, parcelaPagarId: parcelaId);
            _context.MovimentacoesCarteira.Add(movimentacao);

            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }

        public async Task<bool> EstornarParcelaAsync(Guid contaId, Guid parcelaId)
        {
            var conta = await _context.ContasPagar
                .Include(c => c.Parcelas)
                .FirstOrDefaultAsync(c => c.Id == contaId);

            if (conta is null) return false;

            var parcela = conta.Parcelas.FirstOrDefault(p => p.Id == parcelaId)
                ?? throw new KeyNotFoundException("Parcela não encontrada.");

            var valorPago = parcela.ValorPago;
            var carteiraId = parcela.CarteiraId;

            conta.EstornarParcela(parcelaId);

            if (valorPago.HasValue && carteiraId.HasValue)
            {
                var carteira = await _context.Carteiras.FirstOrDefaultAsync(c => c.Id == carteiraId.Value);
                if (carteira is not null)
                {
                    carteira.Creditar(valorPago.Value);

                    var movimentacao = new MovimentacaoCarteira(carteiraId.Value, TipoMovimentacaoCarteira.Credito,
                        OrigemMovimentacaoCarteira.ContaPagar, valorPago.Value, DateTime.UtcNow,
                        $"Estorno baixa parcela {parcela.NumeroParcela}/{conta.Parcelas.Count} - {conta.Descricao}",
                        contaPagarId: contaId, parcelaPagarId: parcelaId);
                    _context.MovimentacoesCarteira.Add(movimentacao);
                }
            }

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

        public async Task<string> ProximoCodigoAsync()
        {
            var numero = await _context.Database
                .SqlQueryRaw<long>("SELECT nextval('conta_pagar_codigo_seq') AS \"Value\"")
                .FirstAsync();

            return numero.ToString("D8");
        }
    }
}
