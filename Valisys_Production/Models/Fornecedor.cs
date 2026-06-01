using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Fornecedor : BaseModels
    {
        public string Nome { get; private set; } = string.Empty;
        public string? NomeFantasia { get; private set; }
        public string? RazaoSocial { get; private set; }
        public string? Cnpj { get; private set; }
        public string Documento { get; private set; } = string.Empty;
        public PapelPessoa PapelPessoa { get; private set; }
        public string? Endereco { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string Telefone { get; private set; } = string.Empty;
        public string? Observacoes { get; private set; }

        protected Fornecedor() { }

        public Fornecedor(string nome, string documento, PapelPessoa papelPessoa,
            string email, string telefone)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(documento);

            Nome = nome;
            Documento = documento;
            PapelPessoa = papelPessoa;
            Email = email;
            Telefone = telefone;
        }

        public void Atualizar(string nome, string documento, PapelPessoa papelPessoa,
            string? endereco, string email, string telefone, string? observacoes,
            string? nomeFantasia, string? razaoSocial, string? cnpj, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(documento);

            Nome = nome;
            Documento = documento;
            PapelPessoa = papelPessoa;
            Endereco = endereco;
            Email = email;
            Telefone = telefone;
            Observacoes = observacoes;
            NomeFantasia = nomeFantasia;
            RazaoSocial = razaoSocial;
            Cnpj = cnpj;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
