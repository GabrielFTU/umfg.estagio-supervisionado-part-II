using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UsuarioReadDto User { get; set; } = null!;
    }
}
