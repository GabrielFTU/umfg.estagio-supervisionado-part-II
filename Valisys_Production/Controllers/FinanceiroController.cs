using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Models.Enums;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/financeiro")]
    public class FinanceiroController : ControllerBase
    {
        private readonly IContaReceberService _receberService;
        private readonly IContaPagarService _pagarService;

        public FinanceiroController(IContaReceberService receberService, IContaPagarService pagarService)
        {
            _receberService = receberService;
            _pagarService = pagarService;
        }

        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(FinanceiroDashboardDto), 200)]
        public async Task<IActionResult> GetDashboard()
        {
            var receber = (await _receberService.GetAllAsync()).ToList();
            var pagar = (await _pagarService.GetAllAsync()).ToList();

            var dashboard = new FinanceiroDashboardDto
            {
                TotalAReceber = receber
                    .Where(c => c.Status != StatusConta.Cancelado && c.Status != StatusConta.Pago)
                    .Sum(c => c.ValorAberto),

                TotalAReceberVencido = receber
                    .Where(c => c.Status == StatusConta.Vencido)
                    .Sum(c => c.ValorAberto),

                TotalAPagar = pagar
                    .Where(c => c.Status != StatusConta.Cancelado && c.Status != StatusConta.Pago)
                    .Sum(c => c.ValorAberto),

                TotalAPagarVencido = pagar
                    .Where(c => c.Status == StatusConta.Vencido)
                    .Sum(c => c.ValorAberto),

                ContasReceberPendentes = receber.Count(c =>
                    c.Status == StatusConta.Pendente || c.Status == StatusConta.ParcialmentePago),

                ContasPagarPendentes = pagar.Count(c =>
                    c.Status == StatusConta.Pendente || c.Status == StatusConta.ParcialmentePago),

                ContasReceberVencidas = receber.Count(c => c.Status == StatusConta.Vencido),

                ContasPagarVencidas = pagar.Count(c => c.Status == StatusConta.Vencido),
            };

            return Ok(dashboard);
        }
    }
}
