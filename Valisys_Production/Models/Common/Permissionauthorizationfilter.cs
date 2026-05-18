using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Valisys_Production.Common;

namespace Valisys_Production.Infrastructure.Authorization
{
    public sealed class PermissionAuthorizationFilter : IAsyncAuthorizationFilter
    {
        private readonly IAuthorizationService _authorizationService;

        public PermissionAuthorizationFilter(IAuthorizationService authorizationService)
        {
            _authorizationService = authorizationService;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var permissions = context.ActionDescriptor.EndpointMetadata
                .OfType<HasPermissionAttribute>()
                .Select(a => a.Permission)
                .Distinct()
                .ToList();

            if (!permissions.Any())
                return;

            foreach (var permission in permissions)
            {
                var result = await _authorizationService.AuthorizeAsync(
                    context.HttpContext.User,
                    null,
                    new PermissaoRequirement(permission));

                if (!result.Succeeded)
                {
                    context.Result = new ObjectResult(new
                    {
                        type = "https://tools.ietf.org/html/rfc9110#section-15.5.4",
                        title = "Acesso negado.",
                        status = 403,
                        detail = $"Você não possui a permissão '{permission}' necessária para acessar este recurso.",
                        traceId = context.HttpContext.TraceIdentifier
                    })
                    {
                        StatusCode = StatusCodes.Status403Forbidden
                    };
                    return;
                }
            }
        }
    }
}