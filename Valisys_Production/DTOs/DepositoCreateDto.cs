namespace Valisys_Production.DTOs
{
    public class DepositoCreateDto
    {
        public Guid AlmoxarifadoId { get; set; }
        public int CodigoIdentificador { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
    }
}
