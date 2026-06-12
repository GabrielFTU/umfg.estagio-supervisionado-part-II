using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class FichaTecnicaUpdateDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Codigo { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Versao { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descricao { get; set; }

        public bool Ativa { get; set; }

        public List<FichaTecnicaItemDto>? Itens { get; set; }

        public List<FichaTecnicaSequenciaItemDto>? Sequencias { get; set; }
    }
}
