using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class LogSistema : BaseModels
    {
        public Guid? UsuarioId { get; private set; }
        public Usuario? Usuario { get; private set; }

        public string Acao { get; private set; } = string.Empty;
        public string Modulo { get; private set; } = string.Empty;
        public string? Detalhes { get; private set; }
        public DateTime DataHora { get; private set; }

        protected LogSistema() { }

        public LogSistema(string acao, string modulo, string? detalhes = null, Guid? usuarioId = null)
        {
            Acao = acao;
            Modulo = modulo;
            Detalhes = detalhes;
            UsuarioId = usuarioId;
            DataHora = DateTime.UtcNow;
        }
    }
}
