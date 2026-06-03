using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class ProdutoVariacaoCreateDto
    {
        [Required, MaxLength(80)] public string Nome { get; set; } = string.Empty;
        [MaxLength(7)] public string? CodigoHex { get; set; }
        [Range(0, double.MaxValue)] public decimal Valor { get; set; }
    }

    public class ProdutoVariacaoUpdateDto
    {
        [Required, MaxLength(80)] public string Nome { get; set; } = string.Empty;
        [MaxLength(7)] public string? CodigoHex { get; set; }
        [Range(0, double.MaxValue)] public decimal Valor { get; set; }
    }

    public class ProdutoVariacaoReadDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? CodigoHex { get; set; }
        public decimal Valor { get; set; }
        public decimal EstoqueAtual { get; set; }
    }
}
