using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Notificacao : BaseModels
    {
        public string Titulo { get; private set; } = string.Empty;
        public string Mensagem { get; private set; } = string.Empty;
        public string Tipo { get; private set; } = string.Empty;
        public Guid? OrdemDeProducaoId { get; private set; }

        protected Notificacao() { }

        public Notificacao(string titulo, string mensagem, string tipo, Guid? ordemDeProducaoId = null)
        {
            Titulo = titulo;
            Mensagem = mensagem;
            Tipo = tipo;
            OrdemDeProducaoId = ordemDeProducaoId;
        }
    }
}
