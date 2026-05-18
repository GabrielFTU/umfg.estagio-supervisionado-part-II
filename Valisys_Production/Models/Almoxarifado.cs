using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Almoxarifado : BaseModels
    {
        public string Nome { get; private set; }
        public string Descricao { get; private set; }
        public string Localizacao { get; private set; }
        public string Responsavel { get; private set; }
        public string? Contato { get; private set; }
        public string? Email { get; private set; }

        protected Almoxarifado() { }

        public Almoxarifado(string nome, string descricao, string localizacao,
            string responsavel, string? contato = null, string? email = null)
        {
            Nome = nome;
            Descricao = descricao;
            Localizacao = localizacao;
            Responsavel = responsavel;
            Contato = contato;
            Email = email;
        }

        public void Atualizar(string nome, string descricao, string localizacao,
            string responsavel, string? contato, string? email, bool ativo)
        {
            Nome = nome;
            Descricao = descricao;
            Localizacao = localizacao;
            Responsavel = responsavel;
            Contato = contato;
            Email = email;
            DefinirAtivo(ativo);
        }
    }
}
