namespace Valisys_Production.DTOs
{
    public record ParcelaCondicaoDto(int Numero, int NumeroDias, decimal Percentual);

    public class CondicaoPagamentoCreateDto
    {
        public string Nome { get; set; } = string.Empty;
        public int NumeroParcelas { get; set; }
        public int DiasParaPrimeiroVencimento { get; set; }
        public int DiasEntreParcelas { get; set; }
        public bool VencimentoDiaFixo { get; set; }
        public List<ParcelaCondicaoDto> Parcelas { get; set; } = [];
    }

    public class CondicaoPagamentoUpdateDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int NumeroParcelas { get; set; }
        public int DiasParaPrimeiroVencimento { get; set; }
        public int DiasEntreParcelas { get; set; }
        public bool VencimentoDiaFixo { get; set; }
        public bool Ativo { get; set; }
        public List<ParcelaCondicaoDto> Parcelas { get; set; } = [];
    }

    public class CondicaoPagamentoReadDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int NumeroParcelas { get; set; }
        public int DiasParaPrimeiroVencimento { get; set; }
        public int DiasEntreParcelas { get; set; }
        public bool VencimentoDiaFixo { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
        public List<ParcelaCondicaoDto> Parcelas { get; set; } = [];
    }
}
