namespace Valisys_Production.DTOs
{
    public class MovimentacaoReadDto
    {
        public Guid Id { get; set; }
        public decimal Quantidade { get; set; }
        public DateTime DataMovimentacao { get; set; }
        public string Justificativa { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;

        public Guid ProdutoId { get; set; }
        public string ProdutoNome { get; set; } = string.Empty;
        public string ProdutoCodigo { get; set; } = string.Empty;
        public string ProdutoUnidade { get; set; } = string.Empty;

        public Guid? AlmoxarifadoOrigemId { get; set; }
        public string? AlmoxarifadoOrigemNome { get; set; }
        public Guid? DepositoOrigemId { get; set; }
        public string? DepositoOrigemNome { get; set; }

        public Guid? AlmoxarifadoDestinoId { get; set; }
        public string? AlmoxarifadoDestinoNome { get; set; }
        public Guid? DepositoDestinoId { get; set; }
        public string? DepositoDestinoNome { get; set; }

        public Guid UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = string.Empty;

        public Guid? OrdemDeProducaoId { get; set; }
        public Guid? PedidoVendaId { get; set; }
        public string? PedidoVendaCodigo { get; set; }
    }
}
