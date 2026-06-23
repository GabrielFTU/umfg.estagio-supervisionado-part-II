using System.Security.Cryptography;

namespace Valisys_Production.Models
{
    public class RefreshToken
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid UsuarioId { get; private set; }
        public string Token { get; private set; } = string.Empty;
        public DateTime ExpiresAt { get; private set; }
        public bool IsRevoked { get; private set; }
        public DateTime CriadoEm { get; private set; } = DateTime.UtcNow;

        public Usuario Usuario { get; private set; } = null!;

        private RefreshToken() { }

        public RefreshToken(Guid usuarioId, DateTime expiresAt)
        {
            UsuarioId = usuarioId;
            ExpiresAt = expiresAt;

            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            Token = Convert.ToBase64String(bytes);
        }

        public bool IsValid() => !IsRevoked && ExpiresAt > DateTime.UtcNow;

        public void Revoke() => IsRevoked = true;
    }
}
