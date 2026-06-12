using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class FichaTecnicaItemDto
    {
        [Required]
        public Guid ProdutoComponenteId { get; set; }

        [Required]
        [Range(0.0001, double.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero")]
        public decimal Quantidade { get; set; }

        [Range(0, 100)]
        public decimal PerdaPercentual { get; set; }

        public Guid? FaseProducaoId { get; set; }

        public Guid? CorId { get; set; }

        [MaxLength(500)]
        public string? Observacao { get; set; }
    }

    public class FichaTecnicaSequenciaItemDto
    {
        [Required]
        public Guid FaseProducaoId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Ordem deve ser maior que zero")]
        public int Ordem { get; set; }

        [Required]
        [MaxLength(500)]
        public string Descricao { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Observacao { get; set; }

        [Range(0, int.MaxValue)]
        public int TempoEstimadoDias { get; set; }
    }

    public class FichaTecnicaCreateDto
    {
        [Required]
        public Guid ProdutoId { get; set; }

        [MaxLength(50)]
        public string? Codigo { get; set; }

        [MaxLength(100)]
        public string Versao { get; set; } = "1.0";

        [MaxLength(500)]
        public string? Descricao { get; set; }

        public List<FichaTecnicaItemDto>? Itens { get; set; }

        public List<FichaTecnicaSequenciaItemDto>? Sequencias { get; set; }
    }
}
