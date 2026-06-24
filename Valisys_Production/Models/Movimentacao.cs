using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Movimentacao : BaseModels
    {
        public DateTime DataMovimentacao { get; private set; }
        public string Justificativa { get; private set; } = string.Empty;
        public decimal Quantidade { get; private set; }
        public TipoMovimentacao Tipo { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public Guid? OrdemDeProducaoId { get; private set; }
        public OrdemDeProducao? OrdemDeProducao { get; private set; }

        public Guid? PedidoVendaId { get; private set; }
        public PedidoVenda? PedidoVenda { get; private set; }

        public Guid? AlmoxarifadoOrigemId { get; private set; }
        public Almoxarifado? AlmoxarifadoOrigem { get; private set; }

        public Guid? DepositoOrigemId { get; private set; }
        public Deposito? DepositoOrigem { get; private set; }

        public Guid? AlmoxarifadoDestinoId { get; private set; }
        public Almoxarifado? AlmoxarifadoDestino { get; private set; }

        public Guid? DepositoDestinoId { get; private set; }
        public Deposito? DepositoDestino { get; private set; }

        public Guid UsuarioId { get; private set; }
        public Usuario Usuario { get; private set; } = null!;

        protected Movimentacao() { }

        public Movimentacao(
            Guid produtoId,
            decimal quantidade,
            string justificativa,
            Guid? almoxarifadoOrigemId,
            Guid? depositoOrigemId,
            Guid? almoxarifadoDestinoId,
            Guid? depositoDestinoId,
            Guid usuarioId,
            Guid? ordemDeProducaoId = null,
            Guid? pedidoVendaId = null)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");
            if (string.IsNullOrWhiteSpace(justificativa))
                throw new ArgumentException("A justificativa é obrigatória.");
            if (almoxarifadoOrigemId == null && almoxarifadoDestinoId == null)
                throw new ArgumentException("Informe ao menos a origem ou o destino da movimentação.");
            if (depositoOrigemId.HasValue && depositoDestinoId.HasValue && depositoOrigemId == depositoDestinoId)
                throw new ArgumentException("O depósito de origem e destino não podem ser o mesmo.");

            ProdutoId             = produtoId;
            Quantidade            = quantidade;
            Justificativa         = justificativa;
            AlmoxarifadoOrigemId  = almoxarifadoOrigemId;
            DepositoOrigemId      = depositoOrigemId;
            AlmoxarifadoDestinoId = almoxarifadoDestinoId;
            DepositoDestinoId     = depositoDestinoId;
            UsuarioId             = usuarioId;
            DataMovimentacao      = DateTime.UtcNow;
            OrdemDeProducaoId     = ordemDeProducaoId;
            PedidoVendaId         = pedidoVendaId;
            Tipo                  = DeterminarTipo();
        }

        private TipoMovimentacao DeterminarTipo()
        {
            if (AlmoxarifadoOrigemId != null && AlmoxarifadoDestinoId != null)
                return TipoMovimentacao.Transferencia;
            if (PedidoVendaId != null || OrdemDeProducaoId != null)
                return TipoMovimentacao.Baixa;
            if (AlmoxarifadoDestinoId != null)
                return TipoMovimentacao.Entrada;
            return TipoMovimentacao.Saida;
        }
    }
}
