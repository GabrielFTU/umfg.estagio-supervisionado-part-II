using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class MovimentacaoItemDto
    {
        [Required]
        public Guid ProdutoId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "A quantidade deve ser positiva.")]
        public decimal Quantidade { get; set; }
    }

    public class MovimentacaoLoteCreateDto
    {
        public Guid? AlmoxarifadoOrigemId { get; set; }
        public Guid? DepositoOrigemId { get; set; }

        public Guid? AlmoxarifadoDestinoId { get; set; }
        public Guid? DepositoDestinoId { get; set; }

        [Required(ErrorMessage = "A justificativa é obrigatória.")]
        [MinLength(3, ErrorMessage = "A justificativa deve ter ao menos 3 caracteres.")]
        public string Justificativa { get; set; } = string.Empty;

        public Guid? OrdemDeProducaoId { get; set; }
        public Guid? PedidoVendaId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Adicione ao menos um produto.")]
        public List<MovimentacaoItemDto> Itens { get; set; } = new();
    }
}
