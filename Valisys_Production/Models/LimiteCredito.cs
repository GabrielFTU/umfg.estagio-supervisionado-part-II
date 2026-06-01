using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public sealed class LimiteCredito : BaseModels
    {
        public int Codigo { get; private set; }
        public Guid PessoaId { get; private set; }
        public decimal LimiteTotal { get; private set; }
        public decimal ValorUtilizado { get; private set; }
        public decimal LimiteDisponivel { get; private set; }
        public RatingRisco RatingRisco { get; private set; }
        public StatusCredito StatusCredito { get; private set; }
        public DateTime DataConcessao { get; private set; }
        public DateTime DataVencimento { get; private set; }
        public DateTime DataProxRevisao { get; private set; }

        public Pessoa Pessoa { get; private set; } = null!;

        protected LimiteCredito() { }

        public LimiteCredito(int codigo,
                             Guid pessoaId,
                             decimal limiteTotal,
                             decimal valorUtilizado,
                             RatingRisco ratingRisco,
                             StatusCredito statusCredito,
                             DateTime dataVencimento,
                             DateTime dataProxRevisao)
        {
            Codigo = codigo;
            PessoaId = pessoaId;
            LimiteTotal = limiteTotal;
            ValorUtilizado = valorUtilizado;
            LimiteDisponivel = limiteTotal - valorUtilizado;
            RatingRisco = ratingRisco;
            StatusCredito = statusCredito;
            DataConcessao = DateTime.UtcNow;
            DataVencimento = dataVencimento;
            DataProxRevisao = dataProxRevisao;
        }

        public void Atualizar(decimal limiteTotal,
                              decimal valorUtilizado,
                              RatingRisco ratingRisco,
                              StatusCredito statusCredito,
                              DateTime dataVencimento,
                              DateTime dataProxRevisao)
        {
            if (limiteTotal < 0)
                throw new ArgumentException("O valor do limite total não pode ser negativo.");

            if (valorUtilizado < 0)
                throw new ArgumentException("O valor utilizado não pode ser negativo.");

            if (dataVencimento <= DateTime.UtcNow)
                throw new ArgumentException("A data de vencimento deve ser futura.");

            if (dataProxRevisao <= DateTime.UtcNow)
                throw new ArgumentException("A data da próxima revisão deve ser futura.");

            LimiteTotal = limiteTotal;
            ValorUtilizado = valorUtilizado;
            LimiteDisponivel = limiteTotal - valorUtilizado;
            RatingRisco = ratingRisco;
            StatusCredito = statusCredito;
            DataVencimento = dataVencimento;
            DataProxRevisao = dataProxRevisao;
            RegistrarAtualizacao();
        }
    }
}
