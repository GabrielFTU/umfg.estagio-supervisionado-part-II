namespace Valisys_Production.Models.Enums
{
    public enum StatusConta
    {
        Pendente = 0,
        ParcialmentePago = 1,
        Pago = 2,
        Vencido = 3,
        Cancelado = 4
    }

    public enum StatusParcela
    {
        Pendente = 0,
        Pago = 1,
        Vencido = 2
    }

    public enum FormaPagamentoEnum
    {
        Dinheiro = 0,
        Pix = 1,
        Boleto = 2,
        CartaoCredito = 3,
        CartaoDebito = 4,
        Transferencia = 5,
        Cheque = 6
    }

    public enum TipoMovimentacaoCarteira
    {
        Credito = 0,
        Debito = 1
    }

    public enum OrigemMovimentacaoCarteira
    {
        ContaPagar = 0,
        ContaReceber = 1
    }

    public enum FrequenciaRecorrencia
    {
        Semanal = 0,
        Quinzenal = 1,
        Mensal = 2,
        Bimestral = 3,
        Trimestral = 4,
        Semestral = 5,
        Anual = 6
    }
}
