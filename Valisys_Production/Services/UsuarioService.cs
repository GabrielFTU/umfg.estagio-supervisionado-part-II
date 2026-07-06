using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Valisys_Production.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;
        private readonly ILogSistemaService _logService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsuarioService(IUsuarioRepository repository, ILogSistemaService logService,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _logService = logService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Usuario> CreateAsync(UsuarioCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Nome) || string.IsNullOrEmpty(dto.Email))
                throw new ArgumentException("Dados obrigatórios faltando.");

            var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
            var usuario = new Usuario(dto.Nome, dto.Email, senhaHash, dto.PerfilId);
            if (!dto.Ativo) usuario.Desativar();

            var created = await _repository.AddAsync(usuario);

            await _logService.RegistrarAsync("Criação", "Usuários",
                $"Criou novo usuário: {created.Email}");

            return created;
        }

        public async Task<Usuario?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Usuario?> GetByEmailAsync(string email) => await _repository.GetByEmailAsync(email);

        public async Task<IEnumerable<Usuario>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(UsuarioUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null) throw new KeyNotFoundException("Usuário não encontrado.");

            var currentUser = _httpContextAccessor.HttpContext?.User;
            bool isAdmin = currentUser?.IsInRole("Administrador") ?? false;

            if (isAdmin)
                existing.Atualizar(dto.Nome, dto.Email, dto.PerfilId, dto.Ativo);
            else
                existing.Atualizar(dto.Nome, dto.Email, existing.PerfilId, existing.Ativo);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "Usuários",
                    $"Atualizou dados do usuário: {existing.Email}");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            var result = await _repository.DeleteAsync(id);

            if (result)
                await _logService.RegistrarAsync("Exclusão", "Usuários",
                    $"Removeu o usuário: {existing.Email}");

            return result;
        }

        public async Task ChangePasswordAsync(Guid usuarioId, ChangePasswordDto dto)
        {
            var usuario = await _repository.GetByIdAsync(usuarioId);
            if (usuario == null) throw new KeyNotFoundException("Usuário não encontrado.");

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            usuario.AtualizarSenha(novaSenhaHash);

            await _repository.UpdateAsync(usuario);

            await _logService.RegistrarAsync("Edição", "Usuários",
                $"Usuário alterou a própria senha: {usuario.Email}");
        }
    }
}
