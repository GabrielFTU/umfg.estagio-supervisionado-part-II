using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class TipoOrdemDeProducao : BaseModels
    {
        public string Nome { get; private set; }
        public string Codigo { get; private set; }
        public string? Descricao { get; private set; }

        public List<OrdemDeProducao> OrdensDeProducao { get; private set; } = new();

        protected TipoOrdemDeProducao() { }

        public TipoOrdemDeProducao(string nome, string codigo, string? descricao = null)
        {
            Nome = nome;
            Codigo = codigo;
            Descricao = descricao;
        }

        public void Atualizar(string nome, string codigo, string? descricao, bool ativo)
        {
            Nome = nome;
            Codigo = codigo;
            Descricao = descricao;
            DefinirAtivo(ativo);
        }
    }
}
