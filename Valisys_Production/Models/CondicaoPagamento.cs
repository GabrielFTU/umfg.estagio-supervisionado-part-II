using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class CondicaoPagamento : BaseModels
    {
        public int Codigo { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public int NumeroParcelas { get; private set; }
        public int DiasParaPrimeiroVencimento { get; private set; }
        public int DiastEntreParcelas { get; private set; }
        public bool VencimentoDiaFixo { get; private set; }

        private readonly List<ParcelaCondicao> _parcelas = [];
        public IReadOnlyCollection<ParcelaCondicao> Parcelas => _parcelas.AsReadOnly();

        protected CondicaoPagamento() { }

        public CondicaoPagamento(int codigo, string nome, int numeroParcelas,
            int diasParaPrimeiroVencimento, int diasEntreParcelas, bool vencimentoDiaFixo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Codigo                      = codigo;
            Nome                        = nome.Trim();
            NumeroParcelas              = numeroParcelas;
            DiasParaPrimeiroVencimento  = diasParaPrimeiroVencimento;
            DiastEntreParcelas          = diasEntreParcelas;
            VencimentoDiaFixo           = vencimentoDiaFixo;
        }

        public void Atualizar(string nome, int numeroParcelas, int diasParaPrimeiroVencimento,
            int diasEntreParcelas, bool vencimentoDiaFixo, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Nome                        = nome.Trim();
            NumeroParcelas              = numeroParcelas;
            DiasParaPrimeiroVencimento  = diasParaPrimeiroVencimento;
            DiastEntreParcelas          = diasEntreParcelas;
            VencimentoDiaFixo           = vencimentoDiaFixo;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }

        public void SetParcelas(IEnumerable<ParcelaCondicao> parcelas)
        {
            _parcelas.Clear();
            _parcelas.AddRange(parcelas);
        }
    }
}
