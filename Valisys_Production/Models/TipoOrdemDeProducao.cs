using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class TipoOrdemDeProducao : BaseModels
    {
        private readonly List<OrdemDeProducao> _ordensDeProducao = new();

        public string Nome { get; private set; } = string.Empty;
        public string Codigo { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }

        public IReadOnlyCollection<OrdemDeProducao> OrdensDeProducao => _ordensDeProducao.AsReadOnly();

        protected TipoOrdemDeProducao() { }

        public TipoOrdemDeProducao(string nome, string codigo, string? descricao = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(codigo);

            Nome = nome;
            Codigo = codigo;
            Descricao = descricao;
        }

        public void Atualizar(string nome, string codigo, string? descricao, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(codigo);

            Nome = nome;
            Codigo = codigo;
            Descricao = descricao;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
