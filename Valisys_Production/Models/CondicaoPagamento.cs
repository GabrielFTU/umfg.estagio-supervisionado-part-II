using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class CondicaoPagamento : BaseModels
    {
        public int Codigo { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public int NumeroParcelas { get; private set; }
        public int DiasParaPrimeiroVencimento { get; private set; }
        public int DiasEntreParcelas { get; private set; }
        public bool VencimentoDiaFixo { get; private set; }
        public int? DiaVencimento { get; private set; }

        private readonly List<ParcelaCondicao> _parcelas = [];
        public IReadOnlyCollection<ParcelaCondicao> Parcelas => _parcelas.AsReadOnly();

        protected CondicaoPagamento() { }

        public CondicaoPagamento(int codigo, string nome, int numeroParcelas,
            int diasParaPrimeiroVencimento, int diasEntreParcelas, bool vencimentoDiaFixo, int? diaVencimento = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            if (vencimentoDiaFixo && (diaVencimento is null or < 1 or > 31))
                throw new ArgumentException("Informe um dia do mês entre 1 e 31 para o vencimento em dia fixo.");

            Codigo                      = codigo;
            Nome                        = nome.Trim();
            NumeroParcelas              = numeroParcelas;
            DiasParaPrimeiroVencimento  = diasParaPrimeiroVencimento;
            DiasEntreParcelas           = diasEntreParcelas;
            VencimentoDiaFixo           = vencimentoDiaFixo;
            DiaVencimento               = vencimentoDiaFixo ? diaVencimento : null;
        }

        public void Atualizar(string nome, int numeroParcelas, int diasParaPrimeiroVencimento,
            int diasEntreParcelas, bool vencimentoDiaFixo, int? diaVencimento, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            if (vencimentoDiaFixo && (diaVencimento is null or < 1 or > 31))
                throw new ArgumentException("Informe um dia do mês entre 1 e 31 para o vencimento em dia fixo.");

            Nome                        = nome.Trim();
            NumeroParcelas              = numeroParcelas;
            DiasParaPrimeiroVencimento  = diasParaPrimeiroVencimento;
            DiasEntreParcelas           = diasEntreParcelas;
            VencimentoDiaFixo           = vencimentoDiaFixo;
            DiaVencimento               = vencimentoDiaFixo ? diaVencimento : null;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }

        public void SetParcelas(IEnumerable<ParcelaCondicao> parcelas)
        {
            _parcelas.Clear();
            _parcelas.AddRange(parcelas);
        }

        public void LimparParcelas() => _parcelas.Clear();

        public void AdicionarParcela(ParcelaCondicao parcela) => _parcelas.Add(parcela);

        /// <summary>
        /// Calcula o vencimento de uma parcela a partir da data base. Quando o vencimento é em dia
        /// fixo, a parcela sempre vence no dia do mês configurado em <see cref="DiaVencimento"/>
        /// (ex.: sempre dia 10), avançando em meses inteiros a partir da data base — em vez de um
        /// deslocamento fixo em dias, que faz o dia do vencimento variar conforme o tamanho do mês.
        /// Meses mais curtos que o dia configurado (ex.: dia 31 em abril) são ajustados para o
        /// último dia daquele mês.
        /// </summary>
        public DateTime CalcularVencimentoParcela(DateTime dataBase, int numeroDias)
        {
            if (!VencimentoDiaFixo || DiaVencimento is null)
                return dataBase.AddDays(numeroDias);

            var meses = (int)Math.Round(numeroDias / 30.0, MidpointRounding.AwayFromZero);
            var alvo = dataBase.AddMonths(meses);
            var ultimoDiaDoMes = DateTime.DaysInMonth(alvo.Year, alvo.Month);
            var dia = Math.Min(DiaVencimento.Value, ultimoDiaDoMes);
            return new DateTime(alvo.Year, alvo.Month, dia);
        }
    }
}
