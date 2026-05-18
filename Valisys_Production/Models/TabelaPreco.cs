using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class TabelaDePreco : BaseModels
    {
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public DateOnly DataValidade { get; set; }
        public string? TipoCliente { get; set; }
    }

    public class ItemTabelaPreco : BaseModels
    {
        public Guid TabelaPrecoId { get; set; }
        public Guid ProdutoId { get; set; }
        public decimal Valor { get; set; }
        public decimal PercDescMaximo { get; set; }
        public TabelaDePreco TabelaDePreco { get; set; }
        public Produto Produto { get; set; }
    }
}
