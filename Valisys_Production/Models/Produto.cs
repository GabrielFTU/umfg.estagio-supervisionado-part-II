using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Produto : BaseModels
    {
        public int CodigoInternoProduto { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string Descricao { get; private set; } = string.Empty;
        public string? Observacoes { get; private set; }
        public string? ImagemUrl { get; private set; }
        public string? Sku { get; private set; }

        public ClassificacaoEnum Classificacao { get; private set; }
        public bool ControlarPorLote { get; private set; }
        public decimal EstoqueMinimo { get; private set; }

        // Fiscal
        public string? Ncm { get; private set; }
        public TipoItem? TipoItem { get; private set; }
        public OrigemMercadoria OrigemMercadoria { get; private set; }

        // Custos
        public decimal CustoPadrao { get; private set; }
        public decimal CustoUltimaCompra { get; private set; }
        public DateTime? DataUltimaCompra { get; private set; }

        // Relacionamentos
        public Guid UnidadeMedidaId { get; private set; }
        public UnidadeMedida UnidadeMedida { get; private set; } = null!;
        public Guid CategoriaProdutoId { get; private set; }
        public CategoriaProduto CategoriaProduto { get; private set; } = null!;

        private readonly List<ProdutoFornecedor> _fornecedores = new();
        public IReadOnlyCollection<ProdutoFornecedor> Fornecedores => _fornecedores.AsReadOnly();

        private readonly List<ProdutoVariacao> _variacoes = new();
        public IReadOnlyCollection<ProdutoVariacao> Variacoes => _variacoes.AsReadOnly();

        protected Produto() { }

        public Produto(
            string nome, string descricao, ClassificacaoEnum classificacao,
            bool controlarPorLote, Guid unidadeMedidaId, Guid categoriaProdutoId,
            string? observacoes = null, string? imagemUrl = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome               = nome;
            Descricao          = descricao;
            Classificacao      = classificacao;
            ControlarPorLote   = controlarPorLote;
            UnidadeMedidaId    = unidadeMedidaId;
            CategoriaProdutoId = categoriaProdutoId;
            Observacoes        = observacoes;
            ImagemUrl          = imagemUrl;
        }

        public void DefinirCodigo(int codigo) => CodigoInternoProduto = codigo;
        public void DefinirSku(string? sku) => Sku = string.IsNullOrWhiteSpace(sku) ? null : sku.Trim().ToUpperInvariant();

        public void DefinirImagem(string? imagemUrl) => ImagemUrl = imagemUrl;

        public void Atualizar(
            string nome, string descricao, ClassificacaoEnum classificacao,
            bool controlarPorLote, decimal estoqueMinimo,
            Guid unidadeMedidaId, Guid categoriaProdutoId,
            string? observacoes, bool ativo, string? imagemUrl = null,
            string? ncm = null, TipoItem? tipoItem = null,
            OrigemMercadoria origemMercadoria = OrigemMercadoria.NacionalExceto3458,
            decimal custoPadrao = 0, decimal custoUltimaCompra = 0,
            DateTime? dataUltimaCompra = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome               = nome;
            Descricao          = descricao;
            Classificacao      = classificacao;
            ControlarPorLote   = controlarPorLote;
            EstoqueMinimo      = estoqueMinimo;
            UnidadeMedidaId    = unidadeMedidaId;
            CategoriaProdutoId = categoriaProdutoId;
            Observacoes        = observacoes;
            ImagemUrl          = imagemUrl ?? ImagemUrl;

            Ncm                 = ncm;
            TipoItem            = tipoItem;
            OrigemMercadoria    = origemMercadoria;
            CustoPadrao         = custoPadrao;
            CustoUltimaCompra   = custoUltimaCompra;
            DataUltimaCompra    = dataUltimaCompra;

            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
