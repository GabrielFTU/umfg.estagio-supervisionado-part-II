using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class ContaReceber : BaseModels
    {
        private readonly List<ParcelaReceber> _parcelas = new();

        public string Codigo { get; private set; } = string.Empty;
        public string Descricao { get; private set; } = string.Empty;
        public decimal ValorTotal { get; private set; }
        public decimal ValorPago { get; private set; }
        public decimal ValorAberto => ValorTotal - ValorPago;
        public DateTime DataEmissao { get; private set; }
        public DateTime DataVencimento { get; private set; }
        public StatusConta Status { get; private set; }
        public string? Observacoes { get; private set; }

        public Guid? PessoaId { get; private set; }
        public Pessoa? Pessoa { get; private set; }

        public Guid? PedidoVendaId { get; private set; }
        public PedidoVenda? PedidoVenda { get; private set; }

        public IReadOnlyCollection<ParcelaReceber> Parcelas => _parcelas.AsReadOnly();

        protected ContaReceber() { }

        public ContaReceber(string descricao, decimal valorTotal, DateTime dataVencimento,
            string? observacoes = null, Guid? pessoaId = null, Guid? pedidoVendaId = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            if (valorTotal <= 0)
                throw new ArgumentException("O valor total deve ser maior que zero.");

            if (dataVencimento.Date < DateTime.UtcNow.Date)
                throw new ArgumentException("A data de vencimento não pode ser no passado.");

            Descricao = descricao;
            ValorTotal = valorTotal;
            DataVencimento = dataVencimento;
            Observacoes = observacoes;
            PessoaId = pessoaId;
            PedidoVendaId = pedidoVendaId;
            DataEmissao = DateTime.UtcNow;
            Status = StatusConta.Pendente;
        }

        public void DefinirCodigo(string codigo) => Codigo = codigo;

        public void AdicionarParcela(ParcelaReceber parcela) => _parcelas.Add(parcela);

        public void LimparParcelas() => _parcelas.Clear();

        public void BaixarParcela(Guid parcelaId, decimal valorPago, DateTime dataPagamento,
            FormaPagamentoEnum formaPagamento, decimal? juros = null,
            decimal? multa = null, string? observacoes = null)
        {
            if (Status == StatusConta.Cancelado)
                throw new InvalidOperationException("Não é possível baixar parcela de uma conta cancelada.");

            var parcela = _parcelas.FirstOrDefault(p => p.Id == parcelaId)
                ?? throw new KeyNotFoundException("Parcela não encontrada.");

            parcela.Baixar(valorPago, dataPagamento, formaPagamento, juros, multa, observacoes);
            RecalcularStatus();
            RegistrarAtualizacao();
        }

        public void Atualizar(string descricao, DateTime dataVencimento, string? observacoes)
        {
            if (Status == StatusConta.Pago || Status == StatusConta.Cancelado)
                throw new InvalidOperationException("Não é possível editar uma conta paga ou cancelada.");

            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            Descricao = descricao;
            DataVencimento = dataVencimento;
            Observacoes = observacoes;
            RegistrarAtualizacao();
        }

        public override void Desativar()
        {
            if (Status == StatusConta.Pago)
                throw new InvalidOperationException("Não é possível cancelar uma conta já paga.");

            Status = StatusConta.Cancelado;
            base.Desativar();
        }

        public void VerificarVencimento()
        {
            if (Status == StatusConta.Cancelado || Status == StatusConta.Pago) return;

            foreach (var p in _parcelas) p.VerificarVencimento();

            if (_parcelas.Any(p => p.Status == StatusParcela.Vencido))
                Status = StatusConta.Vencido;
        }

        private void RecalcularStatus()
        {
            ValorPago = _parcelas
                .Where(p => p.Status == StatusParcela.Pago)
                .Sum(p => p.ValorPago ?? 0);

            if (ValorPago >= ValorTotal)
                Status = StatusConta.Pago;
            else if (ValorPago > 0)
                Status = StatusConta.ParcialmentePago;
            else if (_parcelas.Any(p => p.Status == StatusParcela.Vencido))
                Status = StatusConta.Vencido;
            else
                Status = StatusConta.Pendente;
        }
    }
}
