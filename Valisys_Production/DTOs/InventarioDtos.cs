using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    // ─── Create ───────────────────────────────────────────────────────────────────

    public class InventarioItemCreateDto
    {
        [Required] public Guid ProdutoId { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "A quantidade contada não pode ser negativa.")]
        public decimal QuantidadeContada { get; set; }
    }

    public class InventarioCreateDto
    {
        [Required] public Guid DepositoId { get; set; }
        [Required] public string TipoContagem { get; set; } = "CICLICO";
        [MaxLength(500)] public string? Observacao { get; set; }
        [MinLength(1, ErrorMessage = "Adicione ao menos um produto.")]
        public List<InventarioItemCreateDto> Itens { get; set; } = new();
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    public class InventarioUpdateDto : InventarioCreateDto
    {
        [Required] public Guid Id { get; set; }
    }

    // ─── Read ─────────────────────────────────────────────────────────────────────

    public class InventarioItemReadDto
    {
        public Guid ProdutoId { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public decimal QuantidadeContada { get; set; }
    }

    public class InventarioReadDto
    {
        public Guid Id { get; set; }
        public int Numero { get; set; }
        public Guid DepositoId { get; set; }
        public string DepositoNome { get; set; } = string.Empty;
        public string TipoContagem { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime DataAbertura { get; set; }
        public DateTime? DataFinalizacao { get; set; }
        public string? UsuarioNome { get; set; }
        public List<InventarioItemReadDto> Itens { get; set; } = new();
    }
}
