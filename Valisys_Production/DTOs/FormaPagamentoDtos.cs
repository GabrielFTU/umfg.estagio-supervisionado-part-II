using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class FormaPagamentoCreateDto
    {
        [Required, MaxLength(100)] public string Nome { get; set; } = string.Empty;
        [MaxLength(500)]           public string? Descricao { get; set; }
    }

    public class FormaPagamentoUpdateDto
    {
        [Required] public Guid Id { get; set; }
        [Required, MaxLength(100)] public string Nome { get; set; } = string.Empty;
        [MaxLength(500)]           public string? Descricao { get; set; }
        public bool Ativo { get; set; }
    }

    public class FormaPagamentoReadDto
    {
        public Guid    Id        { get; set; }
        public int     Codigo    { get; set; }
        public string  Nome      { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool    Ativo     { get; set; }
        public bool    RestritaAVendedores { get; set; }
        public List<FormaPagamentoVendedorReadDto> Vendedores { get; set; } = new();
        public DateTime CriadoEm    { get; set; }
        public DateTime? AtualizadoEm { get; set; }
    }

    public class FormaPagamentoVendedorReadDto
    {
        public Guid   Id          { get; set; }
        public Guid   VendedorId  { get; set; }
        public string VendedorNome { get; set; } = string.Empty;
    }
}
