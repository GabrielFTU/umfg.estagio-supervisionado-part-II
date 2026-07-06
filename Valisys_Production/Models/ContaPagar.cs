using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class ContaPagar : BaseModels
    {
        private readonly List<ParcelaPagar> _parcelas = new();

        public string Codigo { get; private set; } = string.Empty;
        public string Descricao { get; private set; } = string.Empty;
        public decimal ValorTotal { get; private set; }
        public decimal ValorPago { get; private set; }
        public decimal ValorAberto => ValorTotal - ValorPago;
        public DateTime DataEmissao { get; private set; }
        public DateTime DataVencimento { get; private set; }
        public StatusConta Status { get; private set; }
        public string? Observacoes { get; private set; }
        public string? NumeroDocumento { get; private set; }

        public Guid? FornecedorId { get; private set; }
        public Pessoa? Fornecedor { get; private set; }

        public Guid? FormaPagamentoId { get; private set; }
        public FormaPagamento? FormaPagamento { get; private set; }

        public Guid? RegraRecorrenciaId { get; private set; }
        public RegraRecorrencia? RegraRecorrencia { get; private set; }
        public int? NumeroOcorrenciaRecorrencia { get; private set; }

        public IReadOnlyCollection<ParcelaPagar> Parcelas => _parcelas.AsReadOnly();

        protected ContaPagar() { }

        public ContaPagar(string descricao, decimal valorTotal, DateTime dataVencimento,
            string? observacoes = null, string? numeroDocumento = null, Guid? fornecedorId = null,
            Guid? formaPagamentoId = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            if (valorTotal <= 0)
                throw new ArgumentException("O valor total deve ser maior que zero.");

            Descricao = descricao;
            ValorTotal = valorTotal;
            DataVencimento = dataVencimento;
            Observacoes = observacoes;
            NumeroDocumento = numeroDocumento;
            FornecedorId = fornecedorId;
            FormaPagamentoId = formaPagamentoId;
            DataEmissao = DateTime.UtcNow;
            Status = StatusConta.Pendente;
        }

        public void DefinirCodigo(string codigo) => Codigo = codigo;

        public void VincularRecorrencia(Guid regraRecorrenciaId, int numeroOcorrencia)
        {
            RegraRecorrenciaId = regraRecorrenciaId;
            NumeroOcorrenciaRecorrencia = numeroOcorrencia;
        }

        public void AdicionarParcela(ParcelaPagar parcela) => _parcelas.Add(parcela);

        public void LimparParcelas() => _parcelas.Clear();

        public BaixaParcelaPagar BaixarParcela(Guid parcelaId, decimal valorPago, DateTime dataPagamento,
            FormaPagamentoEnum formaPagamento, Guid carteiraId, decimal? juros = null,
            decimal? multa = null, string? observacoes = null)
        {
            if (Status == StatusConta.Cancelado)
                throw new InvalidOperationException("Não é possível baixar parcela de uma conta cancelada.");

            var parcela = _parcelas.FirstOrDefault(p => p.Id == parcelaId)
                ?? throw new KeyNotFoundException("Parcela não encontrada.");

            var pagamentoAVista = _parcelas.Count == 1;
            var baixa = parcela.Baixar(valorPago, dataPagamento, formaPagamento, carteiraId, juros, multa, observacoes, pagamentoAVista);
            RecalcularStatus();
            RegistrarAtualizacao();
            return baixa;
        }

        public IReadOnlyList<BaixaParcelaPagar> EstornarParcela(Guid parcelaId)
        {
            if (Status == StatusConta.Cancelado)
                throw new InvalidOperationException("Não é possível estornar parcela de uma conta cancelada.");

            var parcela = _parcelas.FirstOrDefault(p => p.Id == parcelaId)
                ?? throw new KeyNotFoundException("Parcela não encontrada.");

            var baixasRevertidas = parcela.EstornarBaixa();
            RecalcularStatus();
            RegistrarAtualizacao();

            return baixasRevertidas;
        }

        public void Atualizar(string descricao, DateTime dataVencimento, string? observacoes, string? numeroDocumento)
        {
            if (Status == StatusConta.Pago || Status == StatusConta.Cancelado)
                throw new InvalidOperationException("Não é possível editar uma conta paga ou cancelada.");

            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            Descricao = descricao;
            DataVencimento = dataVencimento;
            Observacoes = observacoes;
            NumeroDocumento = numeroDocumento;
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
            ValorPago = _parcelas.Sum(p => p.ValorPago ?? 0);

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
