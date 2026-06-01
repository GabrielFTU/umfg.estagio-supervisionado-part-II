namespace Valisys_Production.DTOs
{
    // --- Contas a Receber ---

    public class ContaReceberCreateDto
    {
        public string Descricao { get; set; } = string.Empty;
        public decimal ValorTotal { get; set; }
        public DateTime DataVencimento { get; set; }
        public string? Observacoes { get; set; }
        public Guid? PessoaId { get; set; }
        public Guid? PedidoVendaId { get; set; }
        public int NumeroParcelas { get; set; } = 1;
    }

    public class ContaReceberReadDto
    {
        public Guid Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public decimal ValorTotal { get; set; }
        public decimal ValorPago { get; set; }
        public decimal ValorAberto { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime DataVencimento { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Observacoes { get; set; }
        public Guid? PessoaId { get; set; }
        public Guid? PedidoVendaId { get; set; }
        public bool Ativo { get; set; }
        public List<ParcelaReceberReadDto> Parcelas { get; set; } = new();
    }

    public class ContaReceberUpdateDto
    {
        public Guid Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataVencimento { get; set; }
        public string? Observacoes { get; set; }
    }

    public class ParcelaReceberReadDto
    {
        public Guid Id { get; set; }
        public int NumeroParcela { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public decimal? ValorPago { get; set; }
        public decimal? Juros { get; set; }
        public decimal? Multa { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? FormaPagamento { get; set; }
        public string? Observacoes { get; set; }
    }

    // --- Contas a Pagar ---

    public class ContaPagarCreateDto
    {
        public string Descricao { get; set; } = string.Empty;
        public decimal ValorTotal { get; set; }
        public DateTime DataVencimento { get; set; }
        public string? Observacoes { get; set; }
        public string? NumeroDocumento { get; set; }
        public Guid? FornecedorId { get; set; }
        public int NumeroParcelas { get; set; } = 1;
    }

    public class ContaPagarReadDto
    {
        public Guid Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public decimal ValorTotal { get; set; }
        public decimal ValorPago { get; set; }
        public decimal ValorAberto { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime DataVencimento { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Observacoes { get; set; }
        public string? NumeroDocumento { get; set; }
        public Guid? FornecedorId { get; set; }
        public string? FornecedorNome { get; set; }
        public bool Ativo { get; set; }
        public List<ParcelaPagarReadDto> Parcelas { get; set; } = new();
    }

    public class ContaPagarUpdateDto
    {
        public Guid Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataVencimento { get; set; }
        public string? Observacoes { get; set; }
        public string? NumeroDocumento { get; set; }
    }

    public class ParcelaPagarReadDto
    {
        public Guid Id { get; set; }
        public int NumeroParcela { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public decimal? ValorPago { get; set; }
        public decimal? Juros { get; set; }
        public decimal? Multa { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? FormaPagamento { get; set; }
        public string? Observacoes { get; set; }
    }

    // --- Baixa de Parcela (shared) ---

    public class ParcelaBaixaDto
    {
        public Guid ContaId { get; set; }
        public Guid ParcelaId { get; set; }
        public decimal ValorPago { get; set; }
        public DateTime DataPagamento { get; set; }
        public int FormaPagamento { get; set; }
        public decimal? Juros { get; set; }
        public decimal? Multa { get; set; }
        public string? Observacoes { get; set; }
    }

    // --- Dashboard Financeiro ---

    public class FinanceiroDashboardDto
    {
        public decimal TotalAReceber { get; set; }
        public decimal TotalAReceberVencido { get; set; }
        public decimal TotalAPagar { get; set; }
        public decimal TotalAPagarVencido { get; set; }
        public int ContasReceberPendentes { get; set; }
        public int ContasPagarPendentes { get; set; }
        public int ContasReceberVencidas { get; set; }
        public int ContasPagarVencidas { get; set; }
        public decimal SaldoLiquido => TotalAReceber - TotalAPagar;
    }
}
