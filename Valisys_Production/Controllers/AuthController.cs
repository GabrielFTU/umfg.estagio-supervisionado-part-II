using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Valisys_Production.DTOs;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IMapper _mapper;

        public AuthController(IAuthService authService, IMapper mapper)
        {
            _authService = authService;
            _mapper = mapper;
        }

        [HttpPost("login")]
        [EnableRateLimiting("login")]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(429)]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var (accessToken, refreshToken, usuario) = await _authService.LoginAsync(loginDto);
                var userDto = _mapper.Map<UsuarioReadDto>(usuario);
                return Ok(new AuthResponseDto { Token = accessToken, RefreshToken = refreshToken, User = userDto });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Credenciais inválidas." });
            }
        }

        [HttpPost("refresh")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var (accessToken, newRefreshToken) = await _authService.RefreshAsync(dto.RefreshToken);
                return Ok(new { token = accessToken, refreshToken = newRefreshToken });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Refresh token inválido ou expirado." });
            }
        }

        [HttpPost("logout")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _authService.LogoutAsync(dto.RefreshToken);
            return NoContent();
        }
    }
}
