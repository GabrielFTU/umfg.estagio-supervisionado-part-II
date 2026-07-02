using Valisys_Production.Models;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Repositories.Interfaces
{
    public interface IContaPagarRepository : IRepository<ContaPagar>
    {
        Task<IEnumerable<ContaPagar>> GetByPeriodoAsync(DateTime inicio, DateTime fim);
        Task<bool> BaixarParcelaAsync(Guid contaId, Guid parcelaId, decimal valorPago,
            DateTime dataPagamento, FormaPagamentoEnum formaPagamento, Guid carteiraId,
            decimal? juros, decimal? multa, string? observacoes);
        Task<bool> EstornarParcelaAsync(Guid contaId, Guid parcelaId);
        Task VerificarVencimentosAsync();
        Task<string> ProximoCodigoAsync();
    }
}
