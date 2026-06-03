using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    /// <summary>
    /// Pessoa Jurídica — mapeada para a tabela "PessoasJuridicas" via TPT.
    /// Herda todos os campos comuns de Pessoa.
    /// </summary>
    public class PessoaJuridica : Pessoa
    {
        public string Cnpj { get; private set; } = string.Empty;
        public string? InscricaoEstadual { get; private set; }
        public string? InscricaoMunicipal { get; private set; }
        public string? ResponsavelNome { get; private set; }
        public string? ResponsavelCpf { get; private set; }

        protected PessoaJuridica() { }

        public PessoaJuridica(
            string razaoSocial,
            string cnpj,
            PapelPessoa papel,
            string? nomeFantasia         = null,
            string? email                = null,
            string? telefone             = null,
            string? celular              = null,
            string? inscricaoEstadual    = null,
            string? inscricaoMunicipal   = null,
            string? responsavelNome      = null,
            string? responsavelCpf       = null,
            Endereco? endereco           = null,
            string? observacoes          = null)
            : base(razaoSocial, papel, nomeFantasia, email, telefone, celular, endereco, observacoes)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(cnpj);

            Cnpj               = cnpj;
            InscricaoEstadual  = inscricaoEstadual;
            InscricaoMunicipal = inscricaoMunicipal;
            ResponsavelNome    = responsavelNome;
            ResponsavelCpf     = responsavelCpf;
        }

        public void Atualizar(
            string razaoSocial,
            string cnpj,
            PapelPessoa papel,
            string? nomeFantasia,
            string? email,
            string? telefone,
            string? celular,
            string? inscricaoEstadual,
            string? inscricaoMunicipal,
            string? responsavelNome,
            string? responsavelCpf,
            Endereco? endereco,
            string? observacoes)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(cnpj);

            Cnpj               = cnpj;
            InscricaoEstadual  = inscricaoEstadual;
            InscricaoMunicipal = inscricaoMunicipal;
            ResponsavelNome    = responsavelNome;
            ResponsavelCpf     = responsavelCpf;

            AtualizarBase(razaoSocial, papel, nomeFantasia, email, telefone, celular, endereco, observacoes);
        }
    }
}
