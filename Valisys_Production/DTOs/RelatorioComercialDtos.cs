namespace Valisys_Production.DTOs
{
    public class RelPedidoVendaDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public DateTime DataEmissao { get; set; }
        public int QuantidadeItens { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class RelVendaPorProdutoDto
    {
        public Guid ProdutoId { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string ProdutoCodigo { get; set; } = string.Empty;
        public string? CategoriaNome { get; set; }
        public int Quantidade { get; set; }
        public decimal ValorTotal { get; set; }
    }

    public class RelVendaPorClienteDto
    {
        public Guid ClienteId { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public int QuantidadePedidos { get; set; }
        public decimal ValorTotal { get; set; }
        public decimal TicketMedio { get; set; }
    }
}
