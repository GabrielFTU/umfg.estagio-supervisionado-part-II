using System;
using System.ComponentModel.DataAnnotations;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class OrdemDeProducaoUpdateDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "A quantidade é obrigatória.")]
        [Range(1, int.MaxValue)]
        public int Quantidade { get; set; }

        public StatusOrdemDeProducao Status { get; set; }

        [StringLength(500)]
        public string? Observacoes { get; set; }

        [Required]
        public Guid AlmoxarifadoId { get; set; }

        public Guid? LoteId { get; set; }
    }
}