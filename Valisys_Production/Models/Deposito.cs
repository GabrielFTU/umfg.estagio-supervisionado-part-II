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
        public bool ControlaLote { get; private set; }

        protected Deposito() { }

        public Deposito(Guid almoxarifadoId, int codigoIdentificador, string nome, string? descricao = null,
            bool controlaLote = false)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            AlmoxarifadoId              = almoxarifadoId;
            CodigoIdentificador         = codigoIdentificador;
            Nome                        = nome;
            Descricao                   = descricao;
            ControlaLote                = controlaLote;
        }

        public void Atualizar(string nome, int codigoIdentificador, string? descricao, bool controlaLote)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome                        = nome;
            CodigoIdentificador         = codigoIdentificador;
            Descricao                   = descricao;
            ControlaLote                = controlaLote;
            RegistrarAtualizacao();
        }
    }
}
