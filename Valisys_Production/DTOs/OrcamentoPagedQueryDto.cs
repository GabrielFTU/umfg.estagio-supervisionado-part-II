using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class OrcamentoPagedQueryDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public StatusOrcamento? Status { get; set; }
        public Guid? ClienteId { get; set; }
        public Guid? RepresentanteId { get; set; }
    }
}
