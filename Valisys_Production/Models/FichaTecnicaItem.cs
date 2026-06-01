using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FichaTecnicaItem : BaseModels
    {
        public Guid ProdutoComponenteId { get; private set; }
        public Produto ProdutoComponente { get; private set; } = null!;

        public decimal Quantidade { get; private set; }
        public decimal PerdaPercentual { get; private set; }

        public Guid FichaTecnicaId { get; private set; }
        public FichaTecnica FichaTecnica { get; private set; } = null!;

        protected FichaTecnicaItem() { }

        public FichaTecnicaItem(Guid produtoComponenteId, decimal quantidade, decimal perdaPercentual)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            if (perdaPercentual < 0 || perdaPercentual > 100)
                throw new ArgumentException("A perda percentual deve estar entre 0 e 100.");

            ProdutoComponenteId = produtoComponenteId;
            Quantidade = quantidade;
            PerdaPercentual = perdaPercentual;
        }

        public void Atualizar(decimal quantidade, decimal perdaPercentual)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            if (perdaPercentual < 0 || perdaPercentual > 100)
                throw new ArgumentException("A perda percentual deve estar entre 0 e 100.");

            Quantidade = quantidade;
            PerdaPercentual = perdaPercentual;
            RegistrarAtualizacao();
        }
    }
}
