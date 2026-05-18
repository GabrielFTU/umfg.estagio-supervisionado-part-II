using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Pessoa : BaseModels
    {
        public TipoPessoa TipoPessoa { get; set; }
        public string NomeRazaoSocial { get; set; }
        public string? ApelidoNomeFantasia { get; set; }
        public string Documento { get; set; }
        public string Email { get; set; }
        public string Telefone { get; set; }
    }
}
