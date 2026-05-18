using System.ComponentModel.DataAnnotations;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class UnidadeMedidaUpdateDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; }

        [Required(ErrorMessage = "A sigla é obrigatória.")]
        [MaxLength(10)]
        public string Sigla { get; set; }

        [Required]
        public GrandezaUnidade Grandeza { get; set; }

        [Required]
        [Range(0.000001, double.MaxValue)]
        public decimal FatorConversao { get; set; }

        public bool EhUnidadeBase { get; set; }

        public bool Ativo { get; set; }
    }
}
