using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class MovimentacaoCarteira : BaseModels
    {
        public Guid CarteiraId { get; private set; }
        public Carteira Carteira { get; private set; } = null!;

        public TipoMovimentacaoCarteira Tipo { get; private set; }
        public OrigemMovimentacaoCarteira Origem { get; private set; }
        public decimal Valor { get; private set; }
        public DateTime DataMovimentacao { get; private set; }
        public string Descricao { get; private set; } = string.Empty;

        public Guid? ContaPagarId { get; private set; }
        public Guid? ContaReceberId { get; private set; }
        public Guid? ParcelaPagarId { get; private set; }
        public Guid? ParcelaReceberId { get; private set; }

        protected MovimentacaoCarteira() { }

        public MovimentacaoCarteira(Guid carteiraId, TipoMovimentacaoCarteira tipo,
            OrigemMovimentacaoCarteira origem, decimal valor, DateTime dataMovimentacao,
            string descricao, Guid? contaPagarId = null, Guid? contaReceberId = null,
            Guid? parcelaPagarId = null, Guid? parcelaReceberId = null)
        {
            if (valor <= 0)
                throw new ArgumentException("O valor da movimentação deve ser maior que zero.");

            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            CarteiraId = carteiraId;
            Tipo = tipo;
            Origem = origem;
            Valor = valor;
            DataMovimentacao = dataMovimentacao;
            Descricao = descricao;
            ContaPagarId = contaPagarId;
            ContaReceberId = contaReceberId;
            ParcelaPagarId = parcelaPagarId;
            ParcelaReceberId = parcelaReceberId;
        }
    }
}
