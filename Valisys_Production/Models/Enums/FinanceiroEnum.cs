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
}
