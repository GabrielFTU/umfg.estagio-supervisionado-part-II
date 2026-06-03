using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class ProdutoVariacao : BaseModels
    {
        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public string Nome { get; private set; } = string.Empty;
        public string? CodigoHex { get; private set; }
        public decimal Valor { get; private set; }

        protected ProdutoVariacao() { }

        public ProdutoVariacao(Guid produtoId, string nome, decimal valor, string? codigoHex = null)
        {
            ProdutoId = produtoId;
            Nome      = nome;
            Valor     = valor;
            CodigoHex = codigoHex;
        }

        public decimal EstoqueAtual { get; private set; }

        public void Atualizar(string nome, decimal valor, string? codigoHex)
        {
            Nome      = nome;
            Valor     = valor;
            CodigoHex = codigoHex;
            RegistrarAtualizacao();
        }

        public void AtualizarEstoque(decimal quantidade)
        {
            EstoqueAtual = quantidade;
            RegistrarAtualizacao();
        }
    }
}
