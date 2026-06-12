using Microsoft.AspNetCore.Mvc;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;
using System.Threading.Tasks;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboard()
        {
            var stats = await _service.GetStatsAsync();
            return Ok(stats);
        }

        [HttpGet("estado/{sigla}")]
        public async Task<ActionResult<EstadoDetalhesDto>> GetEstado(string sigla)
        {
            if (string.IsNullOrWhiteSpace(sigla) || sigla.Length != 2)
                return BadRequest("Sigla de estado inválida.");
            var detalhes = await _service.GetEstadoDetalhesAsync(sigla);
            return Ok(detalhes);
        }
    }
}
