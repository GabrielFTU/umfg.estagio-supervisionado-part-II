using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class Deposito : BaseModels
    {
        public Guid AlmoxarifadoId { get; private set; }
        public Almoxarifado Almoxarifado { get; private set; } = null!;
        public int CodigoIdentificador { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }
        public bool DepositoPadraoRequisicoes { get; private set; }
        public bool ControlaQualidade2a { get; private set; }
        public bool ControlaLote { get; private set; }
        public bool ControlaMultiplosLocais { get; private set; }

        protected Deposito() { }

        public Deposito(Guid almoxarifadoId, int codigoIdentificador, string nome, string? descricao = null,
            bool depositoPadraoRequisicoes = false, bool controlaQualidade2a = false,
            bool controlaLote = false, bool controlaMultiplosLocais = false)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            AlmoxarifadoId              = almoxarifadoId;
            CodigoIdentificador         = codigoIdentificador;
            Nome                        = nome;
            Descricao                   = descricao;
            DepositoPadraoRequisicoes   = depositoPadraoRequisicoes;
            ControlaQualidade2a         = controlaQualidade2a;
            ControlaLote                = controlaLote;
            ControlaMultiplosLocais     = controlaMultiplosLocais;
        }

        public void Atualizar(string nome, int codigoIdentificador, string? descricao,
            bool depositoPadraoRequisicoes, bool controlaQualidade2a,
            bool controlaLote, bool controlaMultiplosLocais)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome                        = nome;
            CodigoIdentificador         = codigoIdentificador;
            Descricao                   = descricao;
            DepositoPadraoRequisicoes   = depositoPadraoRequisicoes;
            ControlaQualidade2a         = controlaQualidade2a;
            ControlaLote                = controlaLote;
            ControlaMultiplosLocais     = controlaMultiplosLocais;
            RegistrarAtualizacao();
        }
    }
}
