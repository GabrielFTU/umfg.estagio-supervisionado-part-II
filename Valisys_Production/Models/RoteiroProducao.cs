using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class RoteiroProducao : BaseModels
    {
        public string Codigo { get; private set; }
        public string Versao { get; private set; }
        public string? Descricao { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; }

        public List<RoteiroProducaoEtapa> Etapas { get; private set; } = new();

        protected RoteiroProducao() { }

        public RoteiroProducao(Guid produtoId, string codigo, string versao, string? descricao = null)
        {
            ProdutoId = produtoId;
            Codigo = codigo;
            Versao = versao;
            Descricao = descricao;
        }

        public void Atualizar(string codigo, string versao, string? descricao, bool ativo)
        {
            Codigo = codigo;
            Versao = versao;
            Descricao = descricao;
            DefinirAtivo(ativo);
        }
    }
}
