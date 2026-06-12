using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FichaTecnica : BaseModels
    {
        private readonly List<FichaTecnicaItem> _itens = new();
        private readonly List<FichaTecnicaSequencia> _sequencias = new();

        public string? CodigoFicha { get; private set; }
        public string Versao { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public IReadOnlyCollection<FichaTecnicaItem> Itens => _itens.AsReadOnly();
        public IReadOnlyCollection<FichaTecnicaSequencia> Sequencias => _sequencias.AsReadOnly();

        protected FichaTecnica() { }

        public FichaTecnica(Guid produtoId, string versao, string? descricao = null)
        {
            ProdutoId = produtoId;
            Versao = versao;
            Descricao = descricao;
        }

        public void DefinirCodigo(string codigo) => CodigoFicha = codigo;

        public void AdicionarItem(FichaTecnicaItem item) => _itens.Add(item);
        public void LimparItens() => _itens.Clear();

        public void AdicionarSequencia(FichaTecnicaSequencia sequencia) => _sequencias.Add(sequencia);
        public void LimparSequencias() => _sequencias.Clear();

        public void Inativar() => Desativar();

        public void Atualizar(string codigoFicha, string versao, string? descricao, bool ativa)
        {
            CodigoFicha = codigoFicha;
            Versao = versao;
            Descricao = descricao;
            DefinirAtivo(ativa);
            RegistrarAtualizacao();
        }
    }
}
