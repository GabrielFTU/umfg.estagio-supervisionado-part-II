using System.ComponentModel.DataAnnotations;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class ProdutoUpdateDto
    {
        [Required] public Guid Id { get; set; }
        [Required, MaxLength(150)] public string Nome { get; set; } = string.Empty;
        [Required, MaxLength(500)] public string Descricao { get; set; } = string.Empty;
        [Required] public ClassificacaoEnum Classificacao { get; set; }
        public bool ControlarPorLote { get; set; }
        [MaxLength(500)] public string? Observacoes { get; set; }
        public string? ImagemUrl { get; set; }
        [MaxLength(50)] public string? Sku { get; set; }

        [Required, Range(0, double.MaxValue)] public decimal EstoqueMinimo { get; set; }
        public bool Ativo { get; set; }

        [Required] public Guid CategoriaProdutoId { get; set; }
        [Required] public Guid UnidadeMedidaId { get; set; }

        // Fiscal
        [MaxLength(10)] public string? Ncm { get; set; }
        public TipoItem? TipoItem { get; set; }
        public OrigemMercadoria OrigemMercadoria { get; set; }

        // Custos
        [Range(0, double.MaxValue)] public decimal CustoPadrao { get; set; }
        [Range(0, double.MaxValue)] public decimal CustoUltimaCompra { get; set; }
        public DateTime? DataUltimaCompra { get; set; }

    }
}
