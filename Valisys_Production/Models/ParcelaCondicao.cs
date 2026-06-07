namespace Valisys_Production.Models
{
    public sealed class ParcelaCondicao
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid CondicaoPagamentoId { get; private set; }
        public int Numero { get; private set; }
        public int NumeroDias { get; private set; }
        public decimal Percentual { get; private set; }

        public CondicaoPagamento? CondicaoPagamento { get; private set; }

        protected ParcelaCondicao() { }

        public ParcelaCondicao(Guid condicaoPagamentoId, int numero, int numeroDias, decimal percentual)
        {
            CondicaoPagamentoId = condicaoPagamentoId;
            Numero              = numero;
            NumeroDias          = numeroDias;
            Percentual          = percentual;
        }
    }
}
