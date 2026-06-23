using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration, ApplicationDbContext context)
        {
            _usuarioRepository = usuarioRepository;
            _configuration = configuration;
            _context = context;
        }

        public async Task<(string AccessToken, string RefreshToken, Usuario User)> LoginAsync(LoginDto loginDto)
        {
            var usuario = await _usuarioRepository.GetByEmailAsync(loginDto.Email);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Senha, usuario.SenhaHash.Trim()))
                throw new UnauthorizedAccessException("Usuário não encontrado ou senha incorreta.");

            if (!usuario.Ativo)
                throw new UnauthorizedAccessException("Usuário inativo.");

            var accessToken = GenerateAccessToken(usuario);
            var refreshToken = await CreateRefreshTokenAsync(usuario.Id);

            return (accessToken, refreshToken.Token, usuario);
        }

        public async Task<(string AccessToken, string RefreshToken)> RefreshAsync(string refreshToken)
        {
            var stored = await _context.RefreshTokens
                .Include(r => r.Usuario)
                    .ThenInclude(u => u.Perfil)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (stored is null || !stored.IsValid())
                throw new UnauthorizedAccessException("Refresh token inválido ou expirado.");

            // Rotate: revoga o atual e emite um novo par
            stored.Revoke();
            var newRefresh = await CreateRefreshTokenAsync(stored.UsuarioId);
            await _context.SaveChangesAsync();

            var accessToken = GenerateAccessToken(stored.Usuario);
            return (accessToken, newRefresh.Token);
        }

        public async Task LogoutAsync(string refreshToken)
        {
            var stored = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (stored is not null)
            {
                stored.Revoke();
                await _context.SaveChangesAsync();
            }
        }

        private string GenerateAccessToken(Usuario usuario)
        {
            var secretKey = _configuration["JwtSettings:SecretKey"]!;
            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim("PerfilId", usuario.PerfilId.ToString()),
                new Claim(ClaimTypes.Role, usuario.Perfil?.Nome ?? "")
            };

            if (usuario.Perfil?.Acessos != null)
                foreach (var acesso in usuario.Perfil.Acessos)
                    claims.Add(new Claim("permissao", acesso));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var handler = new JwtSecurityTokenHandler();
            return handler.WriteToken(handler.CreateToken(tokenDescriptor));
        }

        private async Task<RefreshToken> CreateRefreshTokenAsync(Guid usuarioId)
        {
            var token = new RefreshToken(usuarioId, DateTime.UtcNow.AddDays(30));
            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();
            return token;
        }
    }
}
