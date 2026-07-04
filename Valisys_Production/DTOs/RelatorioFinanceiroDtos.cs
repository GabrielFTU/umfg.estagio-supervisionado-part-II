namespace Valisys_Production.DTOs
{
    public class RelContaPagarDto
    {
        public Guid Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string? FornecedorNome { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime DataVencimento { get; set; }
        public decimal ValorTotal { get; set; }
        public decimal ValorPago { get; set; }
        public decimal ValorAberto { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class RelContaReceberDto
    {
        public Guid Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string? ClienteNome { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime DataVencimento { get; set; }
        public decimal ValorTotal { get; set; }
        public decimal ValorPago { get; set; }
        public decimal ValorAberto { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class RelFluxoCaixaDto
    {
        public string Periodo { get; set; } = string.Empty;
        public decimal TotalAPagar { get; set; }
        public decimal TotalAReceber { get; set; }
        public decimal Saldo { get; set; }
    }
}
