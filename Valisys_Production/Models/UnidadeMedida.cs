using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class UnidadeMedida : BaseModels
    {
        public string Nome { get; private set; } = string.Empty;
        public string Sigla { get; private set; } = string.Empty;
        public GrandezaUnidade Grandeza { get; private set; }
        public decimal FatorConversao { get; private set; }
        public bool EhUnidadeBase { get; private set; }

        protected UnidadeMedida() { }

        public UnidadeMedida(string nome, string sigla, GrandezaUnidade grandeza,
            decimal fatorConversao, bool ehUnidadeBase)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(sigla);

            Nome = nome;
            Sigla = sigla;
            Grandeza = grandeza;
            FatorConversao = fatorConversao;
            EhUnidadeBase = ehUnidadeBase;
        }

        public void Atualizar(string nome, string sigla, GrandezaUnidade grandeza,
            decimal fatorConversao, bool ehUnidadeBase, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(sigla);

            Nome = nome;
            Sigla = sigla;
            Grandeza = grandeza;
            FatorConversao = fatorConversao;
            EhUnidadeBase = ehUnidadeBase;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
