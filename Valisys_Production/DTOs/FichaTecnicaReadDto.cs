namespace Valisys_Production.DTOs
{
    public class FichaTecnicaItemReadDto
    {
        public Guid Id { get; set; }
        public Guid ProdutoComponenteId { get; set; }
        public string ProdutoComponenteNome { get; set; } = string.Empty;
        public string ProdutoComponenteCodigo { get; set; } = string.Empty;
        public string UnidadeMedida { get; set; } = string.Empty;
        public decimal Quantidade { get; set; }
        public decimal PerdaPercentual { get; set; }
        public Guid? FaseProducaoId { get; set; }
        public string? FaseProducaoNome { get; set; }
        public Guid? CorId { get; set; }
        public string? CorNome { get; set; }
        public string? CorHex { get; set; }
        public string? Observacao { get; set; }
    }

    public class FichaTecnicaSequenciaReadDto
    {
        public Guid Id { get; set; }
        public Guid FaseProducaoId { get; set; }
        public string FaseProducaoNome { get; set; } = string.Empty;
        public int Ordem { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public int TempoEstimadoDias { get; set; }
    }

    public class FichaTecnicaReadDto
    {
        public Guid Id { get; set; }
        public Guid ProdutoId { get; set; }
        public string ProdutoCodigo { get; set; } = string.Empty;
        public string ProdutoNome { get; set; } = string.Empty;
        public string? ProdutoImagemUrl { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Versao { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativa { get; set; }
        public List<FichaTecnicaItemReadDto> Itens { get; set; } = new();
        public List<FichaTecnicaSequenciaReadDto> Sequencias { get; set; } = new();
    }
}
