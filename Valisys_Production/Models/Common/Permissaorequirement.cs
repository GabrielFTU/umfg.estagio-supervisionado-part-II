using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Valisys_Production.Common
{
    public sealed class PermissaoRequirement : IAuthorizationRequirement
    {
        public string Permissao { get; }
        public PermissaoRequirement(string permissao) => Permissao = permissao;
    }
    public sealed class PermissaoHandler : AuthorizationHandler<PermissaoRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissaoRequirement requirement)
        {
            // Administrador tem todas as permissões automaticamente
            if (context.User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Administrador"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            var temPermissao = context.User.Claims
                .Where(c => c.Type == "permissao")
                .Any(c => c.Value == requirement.Permissao);

            if (temPermissao)
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public sealed class AutorizarPermissaoAttribute : AuthorizeAttribute
    {
        public AutorizarPermissaoAttribute(string permissao)
            : base(permissao) { }
    }
}