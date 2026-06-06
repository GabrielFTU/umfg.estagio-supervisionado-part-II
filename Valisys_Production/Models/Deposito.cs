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

        protected Deposito() { }

        public Deposito(Guid almoxarifadoId, int codigoIdentificador, string nome, string? descricao = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            AlmoxarifadoId = almoxarifadoId;
            CodigoIdentificador = codigoIdentificador;
            Nome = nome;
            Descricao = descricao;
        }

        public void Atualizar(string nome, int codigoIdentificador, string? descricao)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            CodigoIdentificador = codigoIdentificador;
            Descricao = descricao;
            RegistrarAtualizacao();
        }
    }
}
