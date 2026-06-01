using System.Net;
using System.Text.Json;

namespace Valisys_Production.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exceção não tratada: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            var (status, title) = ex switch
            {
                KeyNotFoundException       => (HttpStatusCode.NotFound, "Recurso não encontrado."),
                ArgumentNullException      => (HttpStatusCode.BadRequest, "Requisição inválida."),
                ArgumentException          => (HttpStatusCode.BadRequest, "Requisição inválida."),
                UnauthorizedAccessException=> (HttpStatusCode.Unauthorized, "Acesso não autorizado."),
                InvalidOperationException  => (HttpStatusCode.Conflict, "Operação inválida."),
                NotImplementedException    => (HttpStatusCode.NotImplemented, "Funcionalidade não implementada."),
                _                          => (HttpStatusCode.InternalServerError, "Erro interno no servidor.")
            };

            var detail = _env.IsDevelopment() ? ex.Message : title;

            var body = new
            {
                type = RfcUri((int)status),
                title,
                status = (int)status,
                detail,
                traceId = context.TraceIdentifier
            };

            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = (int)status;

            return context.Response.WriteAsync(
                JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        }

        private static string RfcUri(int status) => status switch
        {
            400 => "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            401 => "https://tools.ietf.org/html/rfc9110#section-15.5.2",
            404 => "https://tools.ietf.org/html/rfc9110#section-15.5.5",
            409 => "https://tools.ietf.org/html/rfc9110#section-15.5.10",
            501 => "https://tools.ietf.org/html/rfc9110#section-15.6.2",
            _   => "https://tools.ietf.org/html/rfc9110#section-15.6.1"
        };
    }
}
