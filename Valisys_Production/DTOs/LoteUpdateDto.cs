using System;
using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class LoteUpdateDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O código do lote é obrigatório.")]
        [StringLength(50)]
        public string CodigoLote { get; set; }

        [Required(ErrorMessage = "A data de abertura é obrigatória.")]
        public DateTime DataAbertura { get; set; }

        public DateTime? DataConclusao { get; set; }

        [MaxLength(500)]
        public string? Descricao { get; set; }

        [MaxLength(500)]
        public string? Observacoes { get; set; }

        public bool Ativo { get; set; }
    }
}