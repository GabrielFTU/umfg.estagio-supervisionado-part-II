using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Perfil : BaseModels
    {
        public string Nome { get; private set; }
        public List<string> Acessos { get; private set; } = new();

        protected Perfil() { }

        public Perfil(string nome, List<string>? acessos = null)
        {
            Nome = nome;
            Acessos = acessos ?? new List<string>();
        }

        public void AtualizarAcessos(List<string> acessos) => Acessos = acessos;

        public void Atualizar(string nome, bool ativo)
        {
            Nome = nome;
            DefinirAtivo(ativo);
        }
    }
}
