using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Fornecedor : BaseModels
    {
        public string Nome { get; private set; }
        public string? NomeFantasia { get; private set; }
        public string? RazaoSocial { get; private set; }
        public string? Cnpj { get; private set; }
        public string Documento { get; private set; }
        public TipoDocumento TipoDocumento { get; private set; }
        public string? Endereco { get; private set; }
        public string Email { get; private set; }
        public string Telefone { get; private set; }
        public string? Observacoes { get; private set; }

        protected Fornecedor() { }

        public Fornecedor(string nome, string documento, TipoDocumento tipoDocumento,
            string email, string telefone)
        {
            Nome = nome;
            Documento = documento;
            TipoDocumento = tipoDocumento;
            Email = email;
            Telefone = telefone;
        }

        public void Atualizar(string nome, string documento, TipoDocumento tipoDocumento,
            string? endereco, string email, string telefone, string? observacoes,
            string? nomeFantasia, string? razaoSocial, string? cnpj, bool ativo)
        {
            Nome = nome;
            Documento = documento;
            TipoDocumento = tipoDocumento;
            Endereco = endereco;
            Email = email;
            Telefone = telefone;
            Observacoes = observacoes;
            NomeFantasia = nomeFantasia;
            RazaoSocial = razaoSocial;
            Cnpj = cnpj;
            DefinirAtivo(ativo);
        }
    }
}
