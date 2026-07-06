using System;

namespace Valisys_Production.DTOs
{
    public class LoteReadDto
    {
        public Guid Id { get; set; }
        public string CodigoLote { get; set; }
        public string? Descricao { get; set; }
        public string? Observacoes { get; set; }
        public DateTime DataAbertura { get; set; }
        public DateTime? DataConclusao { get; set; }
        public bool Ativo { get; set; }
        public string Status { get; set; }
        public Guid ProdutoId { get; set; }
        public string ProdutoNome { get; set; }
        public Guid AlmoxarifadoId { get; set; }
        public string AlmoxarifadoNome { get; set; }
        public bool EmUso { get; set; }
    }
}