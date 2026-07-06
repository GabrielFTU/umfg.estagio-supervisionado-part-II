using System.ComponentModel.DataAnnotations;

namespace Valisys_Production.DTOs
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "A nova senha é obrigatória.")]
        [StringLength(50, MinimumLength = 6, ErrorMessage = "A nova senha deve ter entre 6 e 50 caracteres.")]
        public string NovaSenha { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirme a nova senha.")]
        [Compare(nameof(NovaSenha), ErrorMessage = "A confirmação não corresponde à nova senha.")]
        public string ConfirmarNovaSenha { get; set; } = string.Empty;
    }
}
