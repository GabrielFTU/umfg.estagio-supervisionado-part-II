using System.ComponentModel.DataAnnotations;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    // ─── Create ───────────────────────────────────────────────────────────────────

    public class ItemPedidoCreateDto
    {
        [Required] public Guid ProdutoId { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero.")]
        public int Quantidade { get; set; }
        [Range(0, double.MaxValue)] public decimal ValorUnitario { get; set; }
        [Range(0, double.MaxValue)] public decimal DescontoUnitario { get; set; }
    }

    public class PedidoVendaCreateDto
    {
        [Required] public Guid ClienteId { get; set; }
        [Required] public Guid RepresentanteId { get; set; }
        public string? FormaPagamento { get; set; }
        public string? CondicaoPagamento { get; set; }
        public string? Finalidade { get; set; }
        public DateTime? DataPrevisaoEntrega { get; set; }
        [Range(0, double.MaxValue)] public decimal Desconto { get; set; }
        public string? ObservacaoInterna { get; set; }
        public string? ObservacaoExterna { get; set; }
        public List<ItemPedidoCreateDto> Itens { get; set; } = new();
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    public class ItemPedidoUpdateDto
    {
        public Guid? Id { get; set; }
        [Required] public Guid ProdutoId { get; set; }
        [Range(1, int.MaxValue)] public int Quantidade { get; set; }
        [Range(0, double.MaxValue)] public decimal ValorUnitario { get; set; }
        [Range(0, double.MaxValue)] public decimal DescontoUnitario { get; set; }
    }

    public class PedidoVendaUpdateDto
    {
        [Required] public Guid Id { get; set; }
        [Required] public Guid ClienteId { get; set; }
        [Required] public Guid RepresentanteId { get; set; }
        public string? FormaPagamento { get; set; }
        public string? CondicaoPagamento { get; set; }
        public string? Finalidade { get; set; }
        public DateTime? DataPrevisaoEntrega { get; set; }
        [Range(0, double.MaxValue)] public decimal Desconto { get; set; }
        public string? ObservacaoInterna { get; set; }
        public string? ObservacaoExterna { get; set; }
        public List<ItemPedidoUpdateDto> Itens { get; set; } = new();
    }

    // ─── Read ─────────────────────────────────────────────────────────────────────

    public class ItemPedidoReadDto
    {
        public Guid Id { get; set; }
        public Guid ProdutoId { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string? ProdutoCodigo { get; set; }
        public string? UnidadeMedida { get; set; }
        public int Quantidade { get; set; }
        public decimal ValorUnitario { get; set; }
        public decimal DescontoUnitario { get; set; }
        public decimal SubTotal { get; set; }
    }

    public class PedidoVendaReadDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public Guid ClienteId { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public Guid? RepresentanteId { get; set; }
        public string? RepresentanteNome { get; set; }
        public string? FormaPagamento { get; set; }
        public string? CondicaoPagamento { get; set; }
        public string? Finalidade { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime? DataPrevisaoEntrega { get; set; }
        public decimal Desconto { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public string? ObservacaoInterna { get; set; }
        public string? ObservacaoExterna { get; set; }
        public StatusPedido Status { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public List<ItemPedidoReadDto> Itens { get; set; } = new();
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
    }

    public class PedidoVendaListDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public string? RepresentanteNome { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime? DataPrevisaoEntrega { get; set; }
        public decimal Total { get; set; }
        public StatusPedido Status { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public int TotalItens { get; set; }
    }
}
