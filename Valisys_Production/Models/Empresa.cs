using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Empresa : BaseModels
    {
        public string RazaoSocial { get; set; }
        public string? NomeFantasia { get; set; }
        public string? Cnpj { get; set; }
    }
}
