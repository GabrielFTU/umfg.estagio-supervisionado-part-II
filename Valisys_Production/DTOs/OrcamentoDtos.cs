using System.ComponentModel.DataAnnotations;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    // ─── Create ───────────────────────────────────────────────────────────────────

    public class ItemOrcamentoCreateDto
    {
        [Required] public Guid ProdutoId { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero.")]
        public int Quantidade { get; set; }
        [Range(0, double.MaxValue)] public decimal ValorUnitario { get; set; }
        [Range(0, double.MaxValue)] public decimal DescontoUnitario { get; set; }
    }

    public class OrcamentoCreateDto
    {
        [Required] public Guid ClienteId { get; set; }
        public Guid? RepresentanteId { get; set; }
        public string? FormaPagamento { get; set; }
        public string? CondicaoPagamento { get; set; }
        public DateTime? DataValidade { get; set; }
        [Range(0, double.MaxValue)] public decimal Desconto { get; set; }
        public string? ObservacaoInterna { get; set; }
        public string? ObservacaoExterna { get; set; }
        public List<ItemOrcamentoCreateDto> Itens { get; set; } = new();
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    public class ItemOrcamentoUpdateDto
    {
        public Guid? Id { get; set; }
        [Required] public Guid ProdutoId { get; set; }
        [Range(1, int.MaxValue)] public int Quantidade { get; set; }
        [Range(0, double.MaxValue)] public decimal ValorUnitario { get; set; }
        [Range(0, double.MaxValue)] public decimal DescontoUnitario { get; set; }
    }

    public class OrcamentoUpdateDto
    {
        [Required] public Guid Id { get; set; }
        [Required] public Guid ClienteId { get; set; }
        public Guid? RepresentanteId { get; set; }
        public string? FormaPagamento { get; set; }
        public string? CondicaoPagamento { get; set; }
        public DateTime? DataValidade { get; set; }
        [Range(0, double.MaxValue)] public decimal Desconto { get; set; }
        public string? ObservacaoInterna { get; set; }
        public string? ObservacaoExterna { get; set; }
        public List<ItemOrcamentoUpdateDto> Itens { get; set; } = new();
    }

    // ─── Read ─────────────────────────────────────────────────────────────────────

    public class ItemOrcamentoReadDto
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

    public class OrcamentoReadDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public Guid ClienteId { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public Guid? RepresentanteId { get; set; }
        public string? RepresentanteNome { get; set; }
        public string? FormaPagamento { get; set; }
        public string? CondicaoPagamento { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime? DataValidade { get; set; }
        public decimal Desconto { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public string? ObservacaoInterna { get; set; }
        public string? ObservacaoExterna { get; set; }
        public StatusOrcamento Status { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public Guid? PedidoVendaConvertidoId { get; set; }
        public List<ItemOrcamentoReadDto> Itens { get; set; } = new();
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
    }

    public class OrcamentoListDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public string? RepresentanteNome { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime? DataValidade { get; set; }
        public decimal Total { get; set; }
        public StatusOrcamento Status { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public int TotalItens { get; set; }
        public List<OrcamentoProdutoDto> Produtos { get; set; } = new();
    }

    public class OrcamentoProdutoDto
    {
        public string Nome { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }

    public class ConverterEmPedidoResultDto
    {
        public Guid PedidoVendaId { get; set; }
        public int PedidoVendaCodigo { get; set; }
    }
}
