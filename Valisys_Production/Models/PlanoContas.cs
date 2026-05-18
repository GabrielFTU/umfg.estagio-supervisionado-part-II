using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class PlanoContas : BaseModels
    {
        public string Codigo { get; set; }
        public string? Descricao { get; set; }
        public string TipoNatureza { get; set; }
    }
}
