using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class ProdutoReadDto
    {
        public Guid Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string? Observacoes { get; set; }
        public string? ImagemUrl { get; set; }
        public string? Sku { get; set; }

        public string Classificacao { get; set; } = string.Empty;
        public int ClassificacaoId { get; set; }
        public bool ControlarPorLote { get; set; }
        public decimal EstoqueMinimo { get; set; }
        public bool Ativo { get; set; }

        // Fiscal
        public string? Ncm { get; set; }
        public int? TipoItemId { get; set; }
        public string? TipoItemNome { get; set; }
        public int OrigemMercadoriaId { get; set; }

        // Custos
        public decimal CustoPadrao { get; set; }
        public decimal CustoUltimaCompra { get; set; }
        public DateTime? DataUltimaCompra { get; set; }

        // Organização
        public Guid CategoriaProdutoId { get; set; }
        public string CategoriaProdutoNome { get; set; } = string.Empty;
        public Guid UnidadeMedidaId { get; set; }
        public string UnidadeMedidaSigla { get; set; } = string.Empty;

        public Guid? AlmoxarifadoEstoqueId { get; set; }
        public string? AlmoxarifadoEstoqueNome { get; set; }

        // Listas
        public List<ProdutoFornecedorReadDto> Fornecedores { get; set; } = new();
        public List<ProdutoVariacaoReadDto> Variacoes { get; set; } = new();
    }
}
