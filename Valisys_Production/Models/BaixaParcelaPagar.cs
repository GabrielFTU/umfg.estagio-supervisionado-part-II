using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class BaixaParcelaPagar : BaseModels
    {
        public Guid ParcelaPagarId { get; private set; }
        public ParcelaPagar ParcelaPagar { get; private set; } = null!;

        public Guid CarteiraId { get; private set; }
        public Carteira Carteira { get; private set; } = null!;

        public decimal ValorPago { get; private set; }
        public decimal Principal { get; private set; }
        public decimal? Juros { get; private set; }
        public decimal? Multa { get; private set; }
        public DateTime DataPagamento { get; private set; }
        public FormaPagamentoEnum FormaPagamento { get; private set; }
        public string? Observacoes { get; private set; }

        public bool Estornada { get; private set; }
        public DateTime? DataEstorno { get; private set; }

        protected BaixaParcelaPagar() { }

        public BaixaParcelaPagar(Guid carteiraId, decimal valorPago, decimal principal,
            decimal? juros, decimal? multa, DateTime dataPagamento,
            FormaPagamentoEnum formaPagamento, string? observacoes)
        {
            if (valorPago <= 0)
                throw new ArgumentException("O valor pago deve ser maior que zero.");

            CarteiraId = carteiraId;
            ValorPago = valorPago;
            Principal = principal;
            Juros = juros;
            Multa = multa;
            DataPagamento = dataPagamento;
            FormaPagamento = formaPagamento;
            Observacoes = observacoes;
        }

        public void Estornar()
        {
            if (Estornada)
                throw new InvalidOperationException("Baixa já foi estornada.");

            Estornada = true;
            DataEstorno = DateTime.UtcNow;
            RegistrarAtualizacao();
        }
    }
}
