namespace Valisys_Production.DTOs
{
    public class AlmoxarifadoReadDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public string Localizacao { get; set; }
        public string Responsavel { get; set; }
        public string? Contato { get; set; }
        public string? Email { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCadastro { get; set; }
    }
}