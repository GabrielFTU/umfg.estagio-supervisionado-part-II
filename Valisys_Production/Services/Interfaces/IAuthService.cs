using Valisys_Production.DTOs;
using Valisys_Production.Models;

namespace Valisys_Production.Services.Interfaces
{
    public interface IAuthService
    {
        Task<(string AccessToken, string RefreshToken, Usuario User)> LoginAsync(LoginDto loginDto);
        Task<(string AccessToken, string RefreshToken)> RefreshAsync(string refreshToken);
        Task LogoutAsync(string refreshToken);
    }
}
