using Valisys_Production.Helpers;
using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    /// <summary>
    /// Pessoa Física — mapeada para a tabela "PessoasFisicas" via TPT.
    /// Herda todos os campos comuns de Pessoa.
    /// </summary>
    public class PessoaFisica : Pessoa
    {
        public string Cpf { get; private set; } = string.Empty;
        public string? Rg { get; private set; }
        public string? OrgaoExpedidor { get; private set; }
        public DateOnly? DataNascimento { get; private set; }
        public SexoPessoa Sexo { get; private set; } = SexoPessoa.NaoInformado;

        protected PessoaFisica() { }

        public PessoaFisica(
            string nome,
            string cpf,
            PapelPessoa papel,
            string? nomeFantasia    = null,
            string? email           = null,
            string? telefone        = null,
            string? celular         = null,
            string? rg              = null,
            string? orgaoExpedidor  = null,
            DateOnly? dataNascimento = null,
            SexoPessoa sexo         = SexoPessoa.NaoInformado,
            Endereco? endereco      = null,
            string? observacoes     = null)
            : base(nome, papel, nomeFantasia, email, telefone, celular, endereco, observacoes)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(cpf);
            if (!DocumentoValidator.EhCpfValido(cpf))
                throw new ArgumentException("CPF inválido.");

            Cpf             = cpf;
            Rg              = rg;
            OrgaoExpedidor  = orgaoExpedidor;
            DataNascimento  = dataNascimento;
            Sexo            = sexo;
        }

        public void Atualizar(
            string nome,
            string cpf,
            PapelPessoa papel,
            string? nomeFantasia,
            string? email,
            string? telefone,
            string? celular,
            string? rg,
            string? orgaoExpedidor,
            DateOnly? dataNascimento,
            SexoPessoa sexo,
            Endereco? endereco,
            string? observacoes)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(cpf);
            if (!DocumentoValidator.EhCpfValido(cpf))
                throw new ArgumentException("CPF inválido.");

            Cpf            = cpf;
            Rg             = rg;
            OrgaoExpedidor = orgaoExpedidor;
            DataNascimento = dataNascimento;
            Sexo           = sexo;

            AtualizarBase(nome, papel, nomeFantasia, email, telefone, celular, endereco, observacoes);
        }
    }
}
