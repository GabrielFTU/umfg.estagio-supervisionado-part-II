using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FichaTecnicaItem : BaseModels
    {
        public Guid ProdutoComponenteId { get; private set; }
        public Produto ProdutoComponente { get; private set; }

        public decimal Quantidade { get; private set; }
        public decimal PerdaPercentual { get; private set; }

        public Guid FichaTecnicaId { get; private set; }
        public FichaTecnica FichaTecnica { get; private set; }

        protected FichaTecnicaItem() { }

        public FichaTecnicaItem(Guid produtoComponenteId, decimal quantidade, decimal perdaPercentual)
        {
            ProdutoComponenteId = produtoComponenteId;
            Quantidade = quantidade;
            PerdaPercentual = perdaPercentual;
        }
    }
}
