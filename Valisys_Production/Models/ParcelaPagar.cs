using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class ParcelaPagar : BaseModels
    {
        public Guid ContaPagarId { get; private set; }
        public ContaPagar ContaPagar { get; private set; } = null!;

        public int NumeroParcela { get; private set; }
        public decimal Valor { get; private set; }
        public DateTime DataVencimento { get; private set; }
        public DateTime? DataPagamento { get; private set; }
        public decimal? ValorPago { get; private set; }
        public decimal? Juros { get; private set; }
        public decimal? Multa { get; private set; }
        public StatusParcela Status { get; private set; }
        public FormaPagamentoEnum? FormaPagamento { get; private set; }
        public string? Observacoes { get; private set; }

        protected ParcelaPagar() { }

        public ParcelaPagar(int numeroParcela, decimal valor, DateTime dataVencimento)
        {
            if (numeroParcela <= 0)
                throw new ArgumentException("O número da parcela deve ser maior que zero.");

            if (valor <= 0)
                throw new ArgumentException("O valor da parcela deve ser maior que zero.");

            NumeroParcela = numeroParcela;
            Valor = valor;
            DataVencimento = dataVencimento;
            Status = StatusParcela.Pendente;
        }

        public void Baixar(decimal valorPago, DateTime dataPagamento,
            FormaPagamentoEnum formaPagamento, decimal? juros = null,
            decimal? multa = null, string? observacoes = null)
        {
            if (Status == StatusParcela.Pago)
                throw new InvalidOperationException("Parcela já foi paga.");

            if (valorPago <= 0)
                throw new ArgumentException("O valor pago deve ser maior que zero.");

            ValorPago = valorPago;
            DataPagamento = dataPagamento;
            FormaPagamento = formaPagamento;
            Juros = juros;
            Multa = multa;
            Observacoes = observacoes;
            Status = StatusParcela.Pago;
            RegistrarAtualizacao();
        }

        public void EstornarBaixa()
        {
            if (Status != StatusParcela.Pago)
                throw new InvalidOperationException("Parcela não está paga.");

            ValorPago = null;
            DataPagamento = null;
            FormaPagamento = null;
            Juros = null;
            Multa = null;
            Observacoes = null;
            Status = DataVencimento.Date < DateTime.UtcNow.Date
                ? StatusParcela.Vencido
                : StatusParcela.Pendente;
            RegistrarAtualizacao();
        }

        public void VerificarVencimento()
        {
            if (Status == StatusParcela.Pendente && DataVencimento.Date < DateTime.UtcNow.Date)
                Status = StatusParcela.Vencido;
        }
    }
}
