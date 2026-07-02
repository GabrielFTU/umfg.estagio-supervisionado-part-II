using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Carteira : BaseModels
    {
        public string CodigoBanco { get; private set; } = string.Empty;
        public string NomeBanco { get; private set; } = string.Empty;
        public string Titular { get; private set; } = string.Empty;
        public decimal SaldoInicial { get; private set; }
        public decimal SaldoAtual { get; private set; }
        public DateTime DataHoraSaldoInicial { get; private set; }

        protected Carteira() { }

        public Carteira(string codigoBanco, string nomeBanco, string titular,
            decimal saldoInicial, DateTime dataHoraSaldoInicial)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(codigoBanco);
            ArgumentException.ThrowIfNullOrWhiteSpace(nomeBanco);
            ArgumentException.ThrowIfNullOrWhiteSpace(titular);

            CodigoBanco = codigoBanco;
            NomeBanco = nomeBanco;
            Titular = titular;
            SaldoInicial = saldoInicial;
            SaldoAtual = saldoInicial;
            DataHoraSaldoInicial = dataHoraSaldoInicial;
        }

        public void Creditar(decimal valor)
        {
            if (valor <= 0)
                throw new ArgumentException("O valor a creditar deve ser maior que zero.");

            SaldoAtual += valor;
            RegistrarAtualizacao();
        }

        public void Debitar(decimal valor)
        {
            if (valor <= 0)
                throw new ArgumentException("O valor a debitar deve ser maior que zero.");

            SaldoAtual -= valor;
            RegistrarAtualizacao();
        }

        public void Atualizar(string codigoBanco, string nomeBanco, string titular,
            decimal saldoInicial, DateTime dataHoraSaldoInicial)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(codigoBanco);
            ArgumentException.ThrowIfNullOrWhiteSpace(nomeBanco);
            ArgumentException.ThrowIfNullOrWhiteSpace(titular);

            CodigoBanco = codigoBanco;
            NomeBanco = nomeBanco;
            Titular = titular;
            SaldoInicial = saldoInicial;
            DataHoraSaldoInicial = dataHoraSaldoInicial;
            RegistrarAtualizacao();
        }
    }
}
