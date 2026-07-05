using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class TipoOrdemDeProducao : BaseModels
    {
        private readonly List<OrdemDeProducao> _ordensDeProducao = new();

        public string Nome { get; private set; } = string.Empty;
        public int Codigo { get; private set; }
        public string? Descricao { get; private set; }

        public IReadOnlyCollection<OrdemDeProducao> OrdensDeProducao => _ordensDeProducao.AsReadOnly();

        protected TipoOrdemDeProducao() { }

        public TipoOrdemDeProducao(string nome, string? descricao = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Descricao = descricao;
        }

        public void DefinirCodigo(int codigo) => Codigo = codigo;

        public void Atualizar(string nome, string? descricao, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Descricao = descricao;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
