using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class ProdutoFornecedor : BaseModels
    {
        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public Guid PessoaId { get; private set; }
        public string FornecedorNome { get; private set; } = string.Empty;

        public bool Principal { get; private set; }
        public string? CodigoFornecedor { get; private set; }
        public decimal? PrecoUltimaCompra { get; private set; }

        protected ProdutoFornecedor() { }

        public ProdutoFornecedor(
            Guid produtoId, Guid pessoaId, string fornecedorNome,
            bool principal = false, string? codigoFornecedor = null,
            decimal? precoUltimaCompra = null)
        {
            ProdutoId        = produtoId;
            PessoaId         = pessoaId;
            FornecedorNome   = fornecedorNome;
            Principal        = principal;
            CodigoFornecedor = codigoFornecedor;
            PrecoUltimaCompra = precoUltimaCompra;
        }

        public void DefinirPrincipal(bool principal) => Principal = principal;

        public void Atualizar(string? codigoFornecedor, decimal? precoUltimaCompra)
        {
            CodigoFornecedor  = codigoFornecedor;
            PrecoUltimaCompra = precoUltimaCompra;
            RegistrarAtualizacao();
        }
    }
}
