using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [Route("api/[controller]")]
    public class NotificacoesController : BaseController
    {
        private readonly INotificacaoService _service;

        public NotificacoesController(INotificacaoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificacaoReadDto>>> GetRecentes()
        {
            var notificacoes = await _service.GetRecentesAsync();

            var dtos = notificacoes.Select(n => new NotificacaoReadDto
            {
                Id = n.Id,
                Titulo = n.Titulo,
                Mensagem = n.Mensagem,
                Tipo = n.Tipo,
                OrdemDeProducaoId = n.OrdemDeProducaoId,
                CriadoEm = n.CriadoEm
            });

            return Ok(dtos);
        }
    }
}
