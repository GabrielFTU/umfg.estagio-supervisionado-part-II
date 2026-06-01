using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Usuario : BaseModels
    {
        public string Nome { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string SenhaHash { get; private set; } = string.Empty;

        public Guid PerfilId { get; private set; }
        public Perfil Perfil { get; private set; } = null!;

        protected Usuario() { }

        public Usuario(string nome, string email, string senhaHash, Guid perfilId)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(email);

            Nome = nome;
            Email = email;
            SenhaHash = senhaHash;
            PerfilId = perfilId;
        }

        public void AtualizarSenha(string senhaHash) => SenhaHash = senhaHash;

        public void Atualizar(string nome, string email, Guid perfilId, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(email);

            Nome = nome;
            Email = email;
            PerfilId = perfilId;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
