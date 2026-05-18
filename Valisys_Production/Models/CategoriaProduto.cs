using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class CategoriaProduto : BaseModels
    {
        public string Nome { get; private set; }
        public string? Codigo { get; private set; }
        public string? Descricao { get; private set; }

        protected CategoriaProduto() { }

        public CategoriaProduto(string nome, string? descricao = null)
        {
            Nome = nome;
            Descricao = descricao;
        }

        public void DefinirCodigo(string codigo) => Codigo = codigo;

        public void Atualizar(string nome, string codigo, bool ativo)
        {
            Nome = nome;
            Codigo = codigo;
            DefinirAtivo(ativo);
        }
    }
}
