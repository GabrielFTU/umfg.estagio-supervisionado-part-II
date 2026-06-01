using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Pessoa : BaseModels
    {
        public string NomeRazaoSocial { get; private set; } = string.Empty;
        public string? ApelidoNomeFantasia { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string Documento { get; private set; } = string.Empty;
        public string Telefone { get; private set; } = string.Empty;
        public Guid LimiteCreditoId { get; private set; }
        public LimiteCredito LimiteCredito { get; private set; } = null!;
        public StatusCredito StatusCredito { get; private set; } = StatusCredito.Em_Revisao;

        protected Pessoa() { }

        public Pessoa(string nomeRazaoSocial,
                      string documento,
                      string email,
                      string telefone,
                      string? apelidoNomeFantasia = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nomeRazaoSocial);
            ArgumentException.ThrowIfNullOrWhiteSpace(documento);

            NomeRazaoSocial = nomeRazaoSocial;
            Documento = documento;
            Email = email;
            Telefone = telefone;
            ApelidoNomeFantasia = apelidoNomeFantasia;
        }

        public void Atualizar(string nomeRazaoSocial,
                              string documento,
                              string email,
                              string telefone,
                              string? apelidoNomeFantasia)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nomeRazaoSocial);
            ArgumentException.ThrowIfNullOrWhiteSpace(documento);

            NomeRazaoSocial = nomeRazaoSocial;
            Documento = documento;
            Email = email;
            Telefone = telefone;
            ApelidoNomeFantasia = apelidoNomeFantasia;
            RegistrarAtualizacao();
        }

        public void VincularLimiteCredito(Guid limiteCreditoId)
        {
            LimiteCreditoId = limiteCreditoId;
        }

        public override void Desativar()
        {
            if (LimiteCredito != null && LimiteCredito.ValorUtilizado != 0)
                throw new InvalidOperationException("Não é possível desativar uma pessoa com saldo pendente.");

            base.Desativar();
        }
    }
}
