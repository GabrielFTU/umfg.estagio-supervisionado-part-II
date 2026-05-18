using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class ItemPedido : BaseModels
    {
        public Guid PedidoVendaId { get; set; }
        public Guid ProdutoId { get; set; }
        public Produto Produto { get; set; }
        public int Quantidade { get; set; }
        public decimal ValorUnitario { get; set; }
        public decimal PercDesconto { get; set; }
        public decimal Subtotal => Quantidade * ValorUnitario * (1 - PercDesconto / 100);
    }

    public class PedidoVenda : BaseModels
    {
        public string Numero { get; set; }
        public Guid ClienteId { get; set; }
        public Guid VendedorId { get; set; }
        public Guid? TabelaPrecoId { get; set; }
        public StatusPedido Status { get; set; } = StatusPedido.Rascunho;
        public DateOnly DataEmissao { get; set; }
        public DateOnly? DataEntrega { get; set; }

        public List<ItemPedido> Itens { get; set; } = new();
        public decimal Total => Itens.Sum(i => i.Subtotal);
    }
}
