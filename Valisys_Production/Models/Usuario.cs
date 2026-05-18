using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Usuario : BaseModels
    {
        public string Nome { get; private set; }
        public string Email { get; private set; }
        public string SenhaHash { get; private set; }

        public Guid PerfilId { get; private set; }
        public Perfil Perfil { get; private set; }

        protected Usuario() { }

        public Usuario(string nome, string email, string senhaHash, Guid perfilId)
        {
            Nome = nome;
            Email = email;
            SenhaHash = senhaHash;
            PerfilId = perfilId;
        }

        public void AtualizarSenha(string senhaHash) => SenhaHash = senhaHash;

        public void Atualizar(string nome, string email, Guid perfilId, bool ativo)
        {
            Nome = nome;
            Email = email;
            PerfilId = perfilId;
            DefinirAtivo(ativo);
        }
    }
}
