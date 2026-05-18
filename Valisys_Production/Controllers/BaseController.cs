using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Valisys_Production.Infrastructure.Authorization;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Authorize]
    [ServiceFilter(typeof(PermissionAuthorizationFilter))]
    public abstract class BaseController : ControllerBase
    {
        protected Guid GetAuthenticatedUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
                throw new UnauthorizedAccessException("Usuário não autenticado.");

            return userId;
        }

        protected ActionResult Problem(string detail, int status = StatusCodes.Status400BadRequest) =>
            StatusCode(status, new
            {
                type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                title = status == 404 ? "Recurso não encontrado." : "Requisição inválida.",
                status,
                detail,
                traceId = HttpContext.TraceIdentifier
            });

        protected ActionResult NotFoundProblem(string detail) =>
            Problem(detail, StatusCodes.Status404NotFound);

        protected ActionResult ConflictProblem(string detail) =>
            StatusCode(StatusCodes.Status409Conflict, new
            {
                type = "https://tools.ietf.org/html/rfc9110#section-15.5.10",
                title = "Conflito.",
                status = 409,
                detail,
                traceId = HttpContext.TraceIdentifier
            });

        protected ActionResult InternalError(string detail) =>
            StatusCode(StatusCodes.Status500InternalServerError, new
            {
                type = "https://tools.ietf.org/html/rfc9110#section-15.6.1",
                title = "Erro interno no servidor.",
                status = 500,
                detail,
                traceId = HttpContext.TraceIdentifier
            });
    }
}