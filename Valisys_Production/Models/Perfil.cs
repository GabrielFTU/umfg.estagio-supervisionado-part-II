using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Perfil : BaseModels
    {
        public string Nome { get; private set; } = string.Empty;
        public List<string> Acessos { get; private set; } = new();

        protected Perfil() { }

        public Perfil(string nome, List<string>? acessos = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Acessos = acessos ?? new List<string>();
        }

        public void AtualizarAcessos(List<string> acessos) => Acessos = acessos;

        public void Atualizar(string nome, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
