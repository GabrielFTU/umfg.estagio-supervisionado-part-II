using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FichaTecnica : BaseModels
    {
        public string? CodigoFicha { get; private set; }
        public string Versao { get; private set; }
        public string? Descricao { get; private set; }
        public bool Ativa { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; }

        public List<FichaTecnicaItem> Itens { get; private set; } = new();

        protected FichaTecnica() { }

        public FichaTecnica(Guid produtoId, string versao, string? descricao = null)
        {
            ProdutoId = produtoId;
            Versao = versao;
            Descricao = descricao;
            Ativa = true;
        }

        public void DefinirCodigo(string codigo) => CodigoFicha = codigo;

        public void Atualizar(string codigoFicha, string versao, string? descricao, bool ativa)
        {
            CodigoFicha = codigoFicha;
            Versao = versao;
            Descricao = descricao;
            Ativa = ativa;
        }
    }
}
