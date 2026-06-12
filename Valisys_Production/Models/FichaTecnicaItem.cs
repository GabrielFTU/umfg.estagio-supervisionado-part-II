using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FichaTecnicaItem : BaseModels
    {
        public Guid ProdutoComponenteId { get; private set; }
        public Produto ProdutoComponente { get; private set; } = null!;

        public Guid? FaseProducaoId { get; private set; }
        public FaseProducao? FaseProducao { get; private set; }

        public Guid? CorId { get; private set; }
        public ProdutoVariacao? Cor { get; private set; }

        public decimal Quantidade { get; private set; }
        public decimal PerdaPercentual { get; private set; }
        public string? Observacao { get; private set; }

        public Guid FichaTecnicaId { get; private set; }
        public FichaTecnica FichaTecnica { get; private set; } = null!;

        protected FichaTecnicaItem() { }

        public FichaTecnicaItem(
            Guid produtoComponenteId,
            decimal quantidade,
            decimal perdaPercentual,
            Guid? faseProducaoId = null,
            Guid? corId = null,
            string? observacao = null)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");
            if (perdaPercentual < 0 || perdaPercentual > 100)
                throw new ArgumentException("A perda percentual deve estar entre 0 e 100.");

            ProdutoComponenteId = produtoComponenteId;
            Quantidade = quantidade;
            PerdaPercentual = perdaPercentual;
            FaseProducaoId = faseProducaoId;
            CorId = corId;
            Observacao = observacao;
        }

        public void SetFichaTecnicaId(Guid fichaTecnicaId) => FichaTecnicaId = fichaTecnicaId;

        public void Atualizar(decimal quantidade, decimal perdaPercentual, Guid? faseProducaoId, Guid? corId, string? observacao)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");
            if (perdaPercentual < 0 || perdaPercentual > 100)
                throw new ArgumentException("A perda percentual deve estar entre 0 e 100.");

            Quantidade = quantidade;
            PerdaPercentual = perdaPercentual;
            FaseProducaoId = faseProducaoId;
            CorId = corId;
            Observacao = observacao;
            RegistrarAtualizacao();
        }
    }
}
