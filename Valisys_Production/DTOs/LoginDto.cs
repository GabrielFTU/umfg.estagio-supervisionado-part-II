using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(128)]
        public string Senha { get; set; } = string.Empty;
    }
}
