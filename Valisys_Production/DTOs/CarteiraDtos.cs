namespace Valisys_Production.DTOs
{
    public class CarteiraCreateDto
    {
        public string CodigoBanco { get; set; } = string.Empty;
        public string NomeBanco { get; set; } = string.Empty;
        public string Titular { get; set; } = string.Empty;
        public decimal SaldoInicial { get; set; }
        public DateTime DataHoraSaldoInicial { get; set; }
    }

    public class CarteiraUpdateDto
    {
        public Guid Id { get; set; }
        public string CodigoBanco { get; set; } = string.Empty;
        public string NomeBanco { get; set; } = string.Empty;
        public string Titular { get; set; } = string.Empty;
        public decimal SaldoInicial { get; set; }
        public DateTime DataHoraSaldoInicial { get; set; }
    }

    public class CarteiraReadDto
    {
        public Guid Id { get; set; }
        public string CodigoBanco { get; set; } = string.Empty;
        public string NomeBanco { get; set; } = string.Empty;
        public string Titular { get; set; } = string.Empty;
        public decimal SaldoInicial { get; set; }
        public decimal SaldoAtual { get; set; }
        public DateTime DataHoraSaldoInicial { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
