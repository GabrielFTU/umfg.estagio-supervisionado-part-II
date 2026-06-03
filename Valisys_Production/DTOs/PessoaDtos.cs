using System.ComponentModel.DataAnnotations;
using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    // ─── Shared ───────────────────────────────────────────────────────────────

    public class EnderecoDto
    {
        public string? Cep { get; set; }
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }

        [MaxLength(2)]
        public string? Uf { get; set; }
        public string? CodigoIbge { get; set; }

        public Endereco ToModel() => new(Cep, Logradouro, Numero, Complemento, Bairro, Cidade, Uf, CodigoIbge);
    }

    // ─── Pessoa Física ────────────────────────────────────────────────────────

    public class PessoaFisicaCreateDto
    {
        [Required, MaxLength(150)]
        public string Nome { get; set; } = string.Empty;

        [Required, MaxLength(11)]
        public string Cpf { get; set; } = string.Empty;

        [Required]
        public PapelPessoa PapelPessoa { get; set; }

        [MaxLength(100)]
        public string? NomeFantasia { get; set; }

        [EmailAddress, MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Telefone { get; set; }

        [MaxLength(20)]
        public string? Celular { get; set; }

        [MaxLength(20)]
        public string? Rg { get; set; }

        [MaxLength(20)]
        public string? OrgaoExpedidor { get; set; }

        public DateOnly? DataNascimento { get; set; }
        public SexoPessoa Sexo { get; set; } = SexoPessoa.NaoInformado;
        public EnderecoDto? Endereco { get; set; }

        [MaxLength(500)]
        public string? Observacoes { get; set; }
    }

    public class PessoaFisicaUpdateDto
    {
        [Required, MaxLength(150)]
        public string Nome { get; set; } = string.Empty;

        [Required, MaxLength(11)]
        public string Cpf { get; set; } = string.Empty;

        [Required]
        public PapelPessoa PapelPessoa { get; set; }

        [MaxLength(100)]
        public string? NomeFantasia { get; set; }

        [EmailAddress, MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Telefone { get; set; }

        [MaxLength(20)]
        public string? Celular { get; set; }

        [MaxLength(20)]
        public string? Rg { get; set; }

        [MaxLength(20)]
        public string? OrgaoExpedidor { get; set; }

        public DateOnly? DataNascimento { get; set; }
        public SexoPessoa Sexo { get; set; } = SexoPessoa.NaoInformado;
        public EnderecoDto? Endereco { get; set; }

        [MaxLength(500)]
        public string? Observacoes { get; set; }
    }

    public class PessoaFisicaReadDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string Cpf { get; set; } = string.Empty;
        public string? Rg { get; set; }
        public string? OrgaoExpedidor { get; set; }
        public DateOnly? DataNascimento { get; set; }
        public SexoPessoa Sexo { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Celular { get; set; }
        public PapelPessoa PapelPessoa { get; set; }
        public EnderecoDto? Endereco { get; set; }
        public string? Observacoes { get; set; }
        public StatusCredito StatusCredito { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCadastro { get; set; }
    }

    // ─── Pessoa Jurídica ──────────────────────────────────────────────────────

    public class PessoaJuridicaCreateDto
    {
        [Required, MaxLength(150)]
        public string RazaoSocial { get; set; } = string.Empty;

        [Required, MaxLength(14)]
        public string Cnpj { get; set; } = string.Empty;

        [Required]
        public PapelPessoa PapelPessoa { get; set; }

        [MaxLength(100)]
        public string? NomeFantasia { get; set; }

        [EmailAddress, MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Telefone { get; set; }

        [MaxLength(20)]
        public string? Celular { get; set; }

        [MaxLength(30)]
        public string? InscricaoEstadual { get; set; }

        [MaxLength(30)]
        public string? InscricaoMunicipal { get; set; }

        [MaxLength(150)]
        public string? ResponsavelNome { get; set; }

        [MaxLength(11)]
        public string? ResponsavelCpf { get; set; }

        public EnderecoDto? Endereco { get; set; }

        [MaxLength(500)]
        public string? Observacoes { get; set; }
    }

    public class PessoaJuridicaUpdateDto
    {
        [Required, MaxLength(150)]
        public string RazaoSocial { get; set; } = string.Empty;

        [Required, MaxLength(14)]
        public string Cnpj { get; set; } = string.Empty;

        [Required]
        public PapelPessoa PapelPessoa { get; set; }

        [MaxLength(100)]
        public string? NomeFantasia { get; set; }

        [EmailAddress, MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Telefone { get; set; }

        [MaxLength(20)]
        public string? Celular { get; set; }

        [MaxLength(30)]
        public string? InscricaoEstadual { get; set; }

        [MaxLength(30)]
        public string? InscricaoMunicipal { get; set; }

        [MaxLength(150)]
        public string? ResponsavelNome { get; set; }

        [MaxLength(11)]
        public string? ResponsavelCpf { get; set; }

        public EnderecoDto? Endereco { get; set; }

        [MaxLength(500)]
        public string? Observacoes { get; set; }
    }

    public class PessoaJuridicaReadDto
    {
        public Guid Id { get; set; }
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string Cnpj { get; set; } = string.Empty;
        public string? InscricaoEstadual { get; set; }
        public string? InscricaoMunicipal { get; set; }
        public string? ResponsavelNome { get; set; }
        public string? ResponsavelCpf { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Celular { get; set; }
        public PapelPessoa PapelPessoa { get; set; }
        public EnderecoDto? Endereco { get; set; }
        public string? Observacoes { get; set; }
        public StatusCredito StatusCredito { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCadastro { get; set; }
    }
}
