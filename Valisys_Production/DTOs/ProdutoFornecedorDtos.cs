using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class ProdutoFornecedorCreateDto
    {
        [Required] public Guid PessoaId { get; set; }
        [Required] public string FornecedorNome { get; set; } = string.Empty;
        public bool Principal { get; set; }
        [MaxLength(50)] public string? CodigoFornecedor { get; set; }
        [Range(0, double.MaxValue)] public decimal? PrecoUltimaCompra { get; set; }
        public Guid? UnidadeMedidaCompraId { get; set; }
        [Range(0.0001, double.MaxValue)] public decimal FatorConversao { get; set; } = 1;
    }

    public class ProdutoFornecedorUpdateDto
    {
        public string? CodigoFornecedor { get; set; }
        [Range(0, double.MaxValue)] public decimal? PrecoUltimaCompra { get; set; }
        public Guid? UnidadeMedidaCompraId { get; set; }
        [Range(0.0001, double.MaxValue)] public decimal FatorConversao { get; set; } = 1;
    }

    public class ProdutoFornecedorReadDto
    {
        public Guid Id { get; set; }
        public Guid PessoaId { get; set; }
        public string FornecedorNome { get; set; } = string.Empty;
        public bool Principal { get; set; }
        public string? CodigoFornecedor { get; set; }
        public decimal? PrecoUltimaCompra { get; set; }
        public Guid? UnidadeMedidaCompraId { get; set; }
        public string? UnidadeMedidaCompraSigla { get; set; }
        public decimal FatorConversao { get; set; } = 1;
    }
}
