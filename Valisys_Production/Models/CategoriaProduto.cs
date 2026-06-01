using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class CategoriaProduto : BaseModels
    {
        public string? CodigoInterno { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }

        protected CategoriaProduto() { }

        public CategoriaProduto(string nome, string? descricao = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Nome = nome;
            Descricao = descricao;
        }

        public void DefinirCodigo(string codigo) => CodigoInterno = codigo;

        public void Atualizar(string nome, string? codigoInterno, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Nome = nome;
            if (!string.IsNullOrWhiteSpace(codigoInterno))
                CodigoInterno = codigoInterno;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
