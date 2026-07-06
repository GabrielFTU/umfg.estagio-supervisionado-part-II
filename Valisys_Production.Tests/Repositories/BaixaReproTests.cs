using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories;

namespace Valisys_Production.Tests.Repositories
{
    public class BaixaReproTests
    {
        [Fact]
        public async Task BaixarParcela_ComParcelaAberta_NaoDeveLancarConcurrencyException()
        {
            var connection = new SqliteConnection("DataSource=:memory:");
            await connection.OpenAsync();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;

            await using var context = new ApplicationDbContext(options);
            await context.Database.EnsureCreatedAsync();

            var carteira = new Carteira("001", "Banco Teste", "Titular Teste", 10000m, DateTime.UtcNow);
            var conta = new ContaPagar("Conta Teste", 500m, DateTime.UtcNow.AddDays(5));
            conta.DefinirCodigo("00000001");
            var parcela = new ParcelaPagar(1, 500m, DateTime.UtcNow.AddDays(5));
            parcela.DefinirCodigo("00000001/1");
            conta.AdicionarParcela(parcela);

            context.Carteiras.Add(carteira);
            context.ContasPagar.Add(conta);
            await context.SaveChangesAsync();

            var contaId = conta.Id;
            var parcelaId = parcela.Id;
            var carteiraId = carteira.Id;

            var repo = new ContaPagarRepository(context);

            var ex = await Record.ExceptionAsync(() => repo.BaixarParcelaAsync(
                contaId, parcelaId, 500m, DateTime.UtcNow, FormaPagamentoEnum.Dinheiro, carteiraId,
                null, null, null));

            if (ex is not null)
                throw new Exception($"Falhou com: {ex.GetType().Name}: {ex.Message}\n{ex}");
        }
    }
}
