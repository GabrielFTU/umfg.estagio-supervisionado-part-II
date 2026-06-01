using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class RoteiroProducao : BaseModels
    {
        private readonly List<RoteiroProducaoEtapa> _etapas = new();

        public string Codigo { get; private set; } = string.Empty;
        public string Versao { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public IReadOnlyCollection<RoteiroProducaoEtapa> Etapas => _etapas.AsReadOnly();

        protected RoteiroProducao() { }

        public RoteiroProducao(Guid produtoId, string codigo, string versao, string? descricao = null)
        {
            ProdutoId = produtoId;
            Codigo = codigo;
            Versao = versao;
            Descricao = descricao;
        }

        public void AdicionarEtapa(RoteiroProducaoEtapa etapa) => _etapas.Add(etapa);

        public void LimparEtapas() => _etapas.Clear();

        public void Atualizar(string codigo, string versao, string? descricao, bool ativo)
        {
            Codigo = codigo;
            Versao = versao;
            Descricao = descricao;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
