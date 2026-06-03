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

        // Conversão: unidade que o fornecedor vende (ex: Rolo) vs unidade de estoque (ex: Metro)
        public Guid? UnidadeMedidaCompraId { get; private set; }
        public UnidadeMedida? UnidadeMedidaCompra { get; private set; }
        public decimal FatorConversao { get; private set; } = 1;

        protected ProdutoFornecedor() { }

        public ProdutoFornecedor(
            Guid produtoId, Guid pessoaId, string fornecedorNome,
            bool principal = false, string? codigoFornecedor = null,
            decimal? precoUltimaCompra = null,
            Guid? unidadeMedidaCompraId = null, decimal fatorConversao = 1)
        {
            ProdutoId             = produtoId;
            PessoaId              = pessoaId;
            FornecedorNome        = fornecedorNome;
            Principal             = principal;
            CodigoFornecedor      = codigoFornecedor;
            PrecoUltimaCompra     = precoUltimaCompra;
            UnidadeMedidaCompraId = unidadeMedidaCompraId;
            FatorConversao        = fatorConversao > 0 ? fatorConversao : 1;
        }

        public void DefinirPrincipal(bool principal) => Principal = principal;

        public void Atualizar(string? codigoFornecedor, decimal? precoUltimaCompra,
            Guid? unidadeMedidaCompraId = null, decimal fatorConversao = 1)
        {
            CodigoFornecedor      = codigoFornecedor;
            PrecoUltimaCompra     = precoUltimaCompra;
            UnidadeMedidaCompraId = unidadeMedidaCompraId;
            FatorConversao        = fatorConversao > 0 ? fatorConversao : 1;
            RegistrarAtualizacao();
        }
    }
}
