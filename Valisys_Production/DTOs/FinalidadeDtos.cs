namespace Valisys_Production.DTOs
{
    public class FinalidadeCreateDto
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
    }

    public class FinalidadeUpdateDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; }
    }

    public class FinalidadeReadDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
