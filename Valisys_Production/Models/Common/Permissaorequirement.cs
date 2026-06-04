using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Valisys_Production.Data;
using Valisys_Production.Models;

namespace Valisys_Production.Common
{
    public sealed class PermissaoRequirement : IAuthorizationRequirement
    {
        public string Permissao { get; }
        public PermissaoRequirement(string permissao) => Permissao = permissao;
    }

    // Registrado como Scoped — uma instância por request, o _cache evita múltiplas queries
    public sealed class PermissaoHandler : AuthorizationHandler<PermissaoRequirement>
    {
        private readonly ApplicationDbContext _db;
        private (Guid UserId, bool IsAdmin, HashSet<string> Permissoes)? _cache;

        public PermissaoHandler(ApplicationDbContext db) => _db = db;

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissaoRequirement requirement)
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? context.User.FindFirst("sub")?.Value;

            if (!Guid.TryParse(userIdStr, out var userId)) return;

            if (_cache?.UserId != userId)
            {
                var nomePerfil = await _db.Set<Usuario>()
                    .AsNoTracking()
                    .Where(u => u.Id == userId && u.Ativo)
                    .Select(u => u.Perfil!.Nome)
                    .FirstOrDefaultAsync();

                if (nomePerfil == null) return;

                HashSet<string> permissoes;
                if (nomePerfil == "Administrador")
                {
                    permissoes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                }
                else
                {
                    var acessos = await _db.Set<Usuario>()
                        .AsNoTracking()
                        .Where(u => u.Id == userId)
                        .Select(u => u.Perfil!.Acessos)
                        .FirstOrDefaultAsync();

                    permissoes = new HashSet<string>(
                        acessos ?? new List<string>(),
                        StringComparer.OrdinalIgnoreCase);
                }

                _cache = (userId, IsAdmin: nomePerfil == "Administrador", permissoes);
            }

            if (_cache.Value.IsAdmin || _cache.Value.Permissoes.Contains(requirement.Permissao))
                context.Succeed(requirement);
        }
    }

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public sealed class AutorizarPermissaoAttribute : AuthorizeAttribute
    {
        public AutorizarPermissaoAttribute(string permissao)
            : base(permissao) { }
    }
}
