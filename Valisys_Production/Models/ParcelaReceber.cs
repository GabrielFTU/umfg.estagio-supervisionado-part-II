using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class ParcelaReceber : BaseModels
    {
        public Guid ContaReceberId { get; private set; }
        public ContaReceber ContaReceber { get; private set; } = null!;

        public string Codigo { get; private set; } = string.Empty;
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

        public Guid? CarteiraId { get; private set; }
        public Carteira? Carteira { get; private set; }

        protected ParcelaReceber() { }

        public ParcelaReceber(int numeroParcela, decimal valor, DateTime dataVencimento)
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

        public void DefinirCodigo(string codigo) => Codigo = codigo;

        public void Baixar(decimal valorPago, DateTime dataPagamento,
            FormaPagamentoEnum formaPagamento, Guid carteiraId, decimal? juros = null,
            decimal? multa = null, string? observacoes = null)
        {
            if (Status == StatusParcela.Pago)
                throw new InvalidOperationException("Parcela já foi paga.");

            if (valorPago <= 0)
                throw new ArgumentException("O valor pago deve ser maior que zero.");

            var principal = valorPago - (juros ?? 0) - (multa ?? 0);
            var valorAberto = Valor - (ValorPago ?? 0);
            if (principal > valorAberto)
                throw new ArgumentException("O valor recebido não pode ser maior que o valor em aberto da parcela.");

            ValorPago = (ValorPago ?? 0) + principal;
            DataPagamento = dataPagamento;
            FormaPagamento = formaPagamento;
            CarteiraId = carteiraId;
            Juros = (Juros ?? 0) + (juros ?? 0);
            Multa = (Multa ?? 0) + (multa ?? 0);
            Observacoes = observacoes;
            if (ValorPago >= Valor)
                Status = StatusParcela.Pago;
            RegistrarAtualizacao();
        }

        public void EstornarBaixa()
        {
            if ((ValorPago ?? 0) <= 0)
                throw new InvalidOperationException("Parcela não possui pagamento para estornar.");

            ValorPago = null;
            DataPagamento = null;
            FormaPagamento = null;
            CarteiraId = null;
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
