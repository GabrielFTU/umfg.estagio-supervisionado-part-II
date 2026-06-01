using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class Movimentacao : BaseModels
    {
        public DateTime DataMovimentacao { get; private set; }
        public string? Observacoes { get; private set; }
        public decimal Quantidade { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public Guid? OrdemDeProducaoId { get; private set; }
        public OrdemDeProducao? OrdemDeProducao { get; private set; }

        public Guid AlmoxarifadoOrigemId { get; private set; }
        public Almoxarifado AlmoxarifadoOrigem { get; private set; } = null!;

        public Guid AlmoxarifadoDestinoId { get; private set; }
        public Almoxarifado AlmoxarifadoDestino { get; private set; } = null!;

        public Guid UsuarioId { get; private set; }
        public Usuario Usuario { get; private set; } = null!;

        protected Movimentacao() { }

        public Movimentacao(Guid produtoId, decimal quantidade, Guid almoxarifadoOrigemId,
            Guid almoxarifadoDestinoId, Guid usuarioId, DateTime dataMovimentacao,
            string? observacoes = null, Guid? ordemDeProducaoId = null)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            ProdutoId = produtoId;
            Quantidade = quantidade;
            AlmoxarifadoOrigemId = almoxarifadoOrigemId;
            AlmoxarifadoDestinoId = almoxarifadoDestinoId;
            UsuarioId = usuarioId;
            DataMovimentacao = dataMovimentacao;
            Observacoes = observacoes;
            OrdemDeProducaoId = ordemDeProducaoId;
        }

        public void Atualizar(decimal quantidade, Guid almoxarifadoOrigemId,
            Guid almoxarifadoDestinoId, string? observacoes)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            Quantidade = quantidade;
            AlmoxarifadoOrigemId = almoxarifadoOrigemId;
            AlmoxarifadoDestinoId = almoxarifadoDestinoId;
            Observacoes = observacoes;
            RegistrarAtualizacao();
        }
    }
}
