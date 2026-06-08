namespace Valisys_Production.DTOs
{
    public class DepositoReadDto
    {
        public Guid Id { get; set; }
        public Guid AlmoxarifadoId { get; set; }
        public string AlmoxarifadoNome { get; set; } = string.Empty;
        public int CodigoIdentificador { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool DepositoPadraoRequisicoes { get; set; }
        public bool ControlaQualidade2a { get; set; }
        public bool ControlaLote { get; set; }
        public bool ControlaMultiplosLocais { get; set; }
        public bool Ativo { get; set; }
    }
}
