using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class SolicitacaoProducaoItem : BaseModels
    {
        public Guid SolicitacaoProducaoId { get; private set; }
        public SolicitacaoProducao SolicitacaoProducao { get; private set; } = null!;

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public int Quantidade { get; private set; }

        protected SolicitacaoProducaoItem() { }

        public SolicitacaoProducaoItem(Guid produtoId, int quantidade)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            ProdutoId = produtoId;
            Quantidade = quantidade;
        }
    }
}
