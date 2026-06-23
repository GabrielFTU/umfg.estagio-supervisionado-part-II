using System.Security.Claims;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid UserId
        {
            get
            {
                var sub = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
            }
        }

        public bool IsAdmin
        {
            get
            {
                var role = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
                return role == "Administrador";
            }
        }

        public bool HasPermission(string permission)
            => _httpContextAccessor.HttpContext?.User.Claims
                   .Any(c => c.Type == "permissao" && c.Value == permission) == true;
    }
}
