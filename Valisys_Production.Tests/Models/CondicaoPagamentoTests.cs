using Valisys_Production.Models;

namespace Valisys_Production.Tests.Models;

public class CondicaoPagamentoTests
{
    [Fact]
    public void CalcularVencimentoParcela_ComVencimentoVariavel_SomaDiasCorridos()
    {
        var condicao = new CondicaoPagamento(1, "30/60/90", 3, 30, 30, vencimentoDiaFixo: false);
        var dataBase = new DateTime(2026, 1, 31);

        var vencimento = condicao.CalcularVencimentoParcela(dataBase, 60);

        Assert.Equal(new DateTime(2026, 4, 1), vencimento);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(30, 2)]
    [InlineData(60, 3)]
    public void CalcularVencimentoParcela_ComDiaFixo_PreservaDiaDoMesEAvancaEmMeses(int numeroDias, int mesEsperado)
    {
        var condicao = new CondicaoPagamento(1, "Mensal dia fixo", 3, 0, 30, vencimentoDiaFixo: true);
        var dataBase = new DateTime(2026, 1, 5);

        var vencimento = condicao.CalcularVencimentoParcela(dataBase, numeroDias);

        Assert.Equal(5, vencimento.Day);
        Assert.Equal(mesEsperado, vencimento.Month);
        Assert.Equal(2026, vencimento.Year);
    }

    [Fact]
    public void CalcularVencimentoParcela_ComDiaFixo_ClampeiaFimDeMesCurto()
    {
        var condicao = new CondicaoPagamento(1, "Mensal dia fixo", 2, 0, 30, vencimentoDiaFixo: true);
        var dataBase = new DateTime(2026, 1, 31);

        var vencimento = condicao.CalcularVencimentoParcela(dataBase, 30);

        Assert.Equal(new DateTime(2026, 2, 28), vencimento);
    }
}
