using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Valisys_Production.DTOs;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/[controller]")]
    public class LogsSistemaController : BaseController
    {
        private readonly ILogSistemaService _service;

        public LogsSistemaController(ILogSistemaService service)
        {
            _service = service;
        }

        [HttpGet]
        [HasPermission(Permissions.Logs.Visualizar)]
        public async Task<ActionResult<IEnumerable<LogSistemaReadDto>>> GetAll(
            [FromQuery] string? modulo = null,
            [FromQuery] string? usuarioNome = null,
            [FromQuery] DateTime? de = null,
            [FromQuery] DateTime? ate = null)
        {
            var logs = await _service.GetAllAsync();

            if (!string.IsNullOrEmpty(modulo))
                logs = logs.Where(l => l.Modulo == modulo);

            if (de.HasValue)
                logs = logs.Where(l => l.DataHora >= de.Value.ToUniversalTime());

            if (ate.HasValue)
                logs = logs.Where(l => l.DataHora <= ate.Value.ToUniversalTime().AddDays(1).AddSeconds(-1));

            var dtos = logs.Select(l => new LogSistemaReadDto
            {
                Id = l.Id,
                UsuarioId = l.UsuarioId,
                UsuarioNome = l.Usuario?.Nome ?? "Sistema",
                Acao = l.Acao,
                Modulo = l.Modulo,
                Detalhes = l.Detalhes,
                DataHora = l.DataHora
            });

            if (!string.IsNullOrEmpty(usuarioNome))
                dtos = dtos.Where(d => d.UsuarioNome.Contains(usuarioNome, StringComparison.OrdinalIgnoreCase));

            return Ok(dtos);
        }
    }
}