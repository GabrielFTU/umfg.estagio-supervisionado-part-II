using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Empresa : BaseModels
    {
        public string RazaoSocial { get; private set; } = string.Empty;
        public string? NomeFantasia { get; private set; }
        public string? Cnpj { get; private set; }

        protected Empresa() { }

        public Empresa(string razaoSocial, string? nomeFantasia = null, string? cnpj = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(razaoSocial);

            RazaoSocial = razaoSocial;
            NomeFantasia = nomeFantasia;
            Cnpj = cnpj;
        }

        public void Atualizar(string razaoSocial, string? nomeFantasia, string? cnpj)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(razaoSocial);

            RazaoSocial = razaoSocial;
            NomeFantasia = nomeFantasia;
            Cnpj = cnpj;
            RegistrarAtualizacao();
        }
    }
}
