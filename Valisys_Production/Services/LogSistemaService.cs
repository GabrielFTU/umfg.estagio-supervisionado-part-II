using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class LogSistemaService : ILogSistemaService
    {
        private readonly ILogSistemaRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LogSistemaService(ILogSistemaRepository repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task RegistrarAsync(string acao, string modulo, string detalhes, Guid? usuarioId = null)
        {
            if (!usuarioId.HasValue)
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var id))
                    usuarioId = id;
            }

            var log = new LogSistema(acao, modulo, detalhes, usuarioId);
            await _repository.AddAsync(log);
        }

        public async Task<IEnumerable<LogSistema>> GetAllAsync() => await _repository.GetAllAsync();
    }
}
