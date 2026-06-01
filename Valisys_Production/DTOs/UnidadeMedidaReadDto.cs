using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class UnidadeMedidaReadDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; }
        public string Sigla { get; set; }
        public GrandezaUnidade Grandeza { get; set; }
        public decimal FatorConversao { get; set; }
        public bool EhUnidadeBase { get; set; }
        public bool Ativo { get; set; }
    }
}
