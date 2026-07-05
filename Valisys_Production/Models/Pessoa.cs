using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    /// <summary>
    /// Entidade base — mapeada para a tabela "Pessoas".
    /// PessoaFisica e PessoaJuridica herdam via TPT (Table Per Type).
    /// </summary>
    public abstract class Pessoa : BaseModels
    {
        public string Nome { get; protected set; } = string.Empty;
        public string? NomeFantasia { get; protected set; }
        public string? Email { get; protected set; }
        public string? Telefone { get; protected set; }
        public string? Celular { get; protected set; }
        public Endereco? Endereco { get; protected set; }
        public PapelPessoa PapelPessoa { get; protected set; }
        public string? Observacoes { get; protected set; }
        public StatusCredito StatusCredito { get; protected set; } = StatusCredito.Em_Revisao;

        protected Pessoa() { }

        protected Pessoa(
            string nome,
            PapelPessoa papel,
            string? nomeFantasia = null,
            string? email        = null,
            string? telefone     = null,
            string? celular      = null,
            Endereco? endereco   = null,
            string? observacoes  = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome        = nome;
            PapelPessoa = papel;
            NomeFantasia = nomeFantasia;
            Email       = email;
            Telefone    = telefone;
            Celular     = celular;
            Endereco    = endereco;
            Observacoes = observacoes;
        }

        protected void AtualizarBase(
            string nome,
            PapelPessoa papel,
            string? nomeFantasia,
            string? email,
            string? telefone,
            string? celular,
            Endereco? endereco,
            string? observacoes)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome        = nome;
            PapelPessoa = papel;
            NomeFantasia = nomeFantasia;
            Email       = email;
            Telefone    = telefone;
            Celular     = celular;
            Endereco    = endereco;
            Observacoes = observacoes;
            RegistrarAtualizacao();
        }

        public void BloquearCredito()
            => StatusCredito = Enums.StatusCredito.Bloqueado;

        public void DesbloquearCredito()
            => StatusCredito = Enums.StatusCredito.Em_Revisao;
    }
}
