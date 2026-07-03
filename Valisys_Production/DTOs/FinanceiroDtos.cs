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
        public Guid CondicaoPagamentoId { get; set; }
        public Guid? FormaPagamentoId { get; set; }
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
        public string? PessoaNome { get; set; }
        public Guid? PedidoVendaId { get; set; }
        public string? PedidoVendaCodigo { get; set; }
        public Guid? FormaPagamentoId { get; set; }
        public string? FormaPagamentoNome { get; set; }
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
        public string Codigo { get; set; } = string.Empty;
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
        public Guid CondicaoPagamentoId { get; set; }
        public Guid? FormaPagamentoId { get; set; }
        public RecorrenciaDto? Recorrencia { get; set; }
    }

    public class RecorrenciaDto
    {
        public string Frequencia { get; set; } = string.Empty;
        public int NumeroOcorrencias { get; set; }
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
        public Guid? FormaPagamentoId { get; set; }
        public string? FormaPagamentoNome { get; set; }
        public bool Ativo { get; set; }
        public bool Recorrente { get; set; }
        public int? NumeroOcorrenciaRecorrencia { get; set; }
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
        public string Codigo { get; set; } = string.Empty;
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

    // --- Estorno de Parcela ---

    public class ParcelaEstornoDto
    {
        public Guid ContaId { get; set; }
        public Guid ParcelaId { get; set; }
    }

    // --- Baixa de Parcela (shared) ---

    public class ParcelaBaixaDto
    {
        public Guid ContaId { get; set; }
        public Guid ParcelaId { get; set; }
        public decimal ValorPago { get; set; }
        public DateTime DataPagamento { get; set; }
        public int FormaPagamento { get; set; }
        public Guid CarteiraId { get; set; }
        public decimal? Juros { get; set; }
        public decimal? Multa { get; set; }
        public string? Observacoes { get; set; }
    }

    // --- Movimentação de Carteira ---

    public class MovimentacaoCarteiraReadDto
    {
        public Guid Id { get; set; }
        public Guid CarteiraId { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Origem { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime DataMovimentacao { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public Guid? ContaPagarId { get; set; }
        public Guid? ContaReceberId { get; set; }
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
