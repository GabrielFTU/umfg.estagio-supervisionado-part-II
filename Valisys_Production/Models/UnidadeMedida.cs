using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class UnidadeMedida : BaseModels
    {
        public string Nome { get; private set; }
        public string Sigla { get; private set; }
        public GrandezaUnidade Grandeza { get; private set; }
        public decimal FatorConversao { get; private set; }
        public bool EhUnidadeBase { get; private set; }

        protected UnidadeMedida() { }

        public UnidadeMedida(string nome, string sigla, GrandezaUnidade grandeza,
            decimal fatorConversao, bool ehUnidadeBase)
        {
            Nome = nome;
            Sigla = sigla;
            Grandeza = grandeza;
            FatorConversao = fatorConversao;
            EhUnidadeBase = ehUnidadeBase;
        }

        public void Atualizar(string nome, string sigla, GrandezaUnidade grandeza,
            decimal fatorConversao, bool ehUnidadeBase, bool ativo)
        {
            Nome = nome;
            Sigla = sigla;
            Grandeza = grandeza;
            FatorConversao = fatorConversao;
            EhUnidadeBase = ehUnidadeBase;
            DefinirAtivo(ativo);
        }
    }
}
