namespace Valisys_Production.DTOs
{
    public class RelAbaixoMinimoDto
    {
        public Guid Id { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string ProdutoCodigo { get; set; } = string.Empty;
        public string? CategoriaNome { get; set; }
        public string Unidade { get; set; } = string.Empty;
        public decimal EstoqueAtual { get; set; }
        public decimal EstoqueMinimo { get; set; }
        public decimal Diferenca { get; set; }
    }

    public class RelSaldoProdutoDto
    {
        public Guid Id { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string ProdutoCodigo { get; set; } = string.Empty;
        public string? CategoriaNome { get; set; }
        public string Unidade { get; set; } = string.Empty;
        public decimal SaldoTotal { get; set; }
        public decimal CustoMedio { get; set; }
        public decimal ValorTotal { get; set; }
    }

    public class RelSaldoDepositoDto
    {
        public Guid Id { get; set; }
        public string DepositoNome { get; set; } = string.Empty;
        public string? AlmoxarifadoNome { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string ProdutoCodigo { get; set; } = string.Empty;
        public string Unidade { get; set; } = string.Empty;
        public decimal Saldo { get; set; }
    }
}
