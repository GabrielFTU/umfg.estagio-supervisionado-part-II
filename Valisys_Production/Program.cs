using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Threading.RateLimiting;
using Valisys_Production.Common;
using Valisys_Production.Data;
using Valisys_Production.Helpers;
using Valisys_Production.Infrastructure.Authorization;
using Valisys_Production.Middleware;
using Valisys_Production.Repositories;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;
using Valisys_Production.Services.Interfaces;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Carrega o arquivo .env da raiz do repositório (desenvolvimento local sem Docker).
// Em Docker/produção, as variáveis de ambiente já estão definidas no ambiente do container.
LoadDotEnv(Directory.GetCurrentDirectory());

var builder = WebApplication.CreateBuilder(args);

// Em desenvolvimento, constrói a connection string e demais segredos a partir do .env.
// Isso sobrescreve qualquer valor em appsettings.Development.json para manter
// o .env como fonte única de verdade.
if (builder.Environment.IsDevelopment())
{
    var dbUser   = Env("DB_USER",   "postgres");
    var dbPass   = Env("DB_PASSWORD", "");
    var dbName   = Env("DB_NAME",   "ValisysProduction");
    var dbPort   = Env("DB_PORT",   "5433");
    var dbHost   = Env("DB_HOST",   "localhost");

    builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["ConnectionStrings:DefaultConnection"] =
            $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};Timeout=30;Command Timeout=30;",
        ["JwtSettings:SecretKey"] = Env("JWT_SECRET", ""),
        ["Aws:BucketName"]        = Env("AWS_BUCKET_NAME", ""),
        ["Aws:Region"]            = Env("AWS_REGION", "sa-east-1"),
        ["AWS__AccessKey"]        = Env("AWS_ACCESS_KEY", ""),
        ["AWS__SecretKey"]        = Env("AWS_SECRET_KEY", ""),
    });
}

var secretKey = builder.Configuration["JwtSettings:SecretKey"];

if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
    throw new InvalidOperationException("A chave JWT (JwtSettings:SecretKey) deve ter no mínimo 32 caracteres.");

var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddHttpContextAccessor();

builder.Services.AddRateLimiter(options =>
{
    options.AddSlidingWindowLimiter("login", opt =>
    {
        opt.PermitLimit     = 5;
        opt.Window          = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 6;
        opt.QueueLimit      = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"message\":\"Muitas tentativas. Aguarde um momento antes de tentar novamente.\"}",
            token);
    };
});

builder.Services.AddControllers(options =>
{
    options.Filters.Add<XssSanitizationFilter>();
})
.ConfigureApiBehaviorOptions(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Valisys API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT desta maneira: Bearer {seu token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Limita o corpo das requisições a 10 MB (padrão é 28 MB no Kestrel)
builder.WebHost.ConfigureKestrel(opt =>
    opt.Limits.MaxRequestBodySize = 10 * 1024 * 1024);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddScoped<IFornecedorRepository, FornecedorRepository>();
builder.Services.AddScoped<IFornecedorService, FornecedorService>();
builder.Services.AddScoped<IAlmoxarifadoRepository, AlmoxarifadoRepository>();
builder.Services.AddScoped<IAlmoxarifadoService, AlmoxarifadoService>();
builder.Services.AddScoped<IDepositoRepository, DepositoRepository>();
builder.Services.AddScoped<IDepositoService, DepositoService>();
builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddScoped<ILoteRepository, LoteRepository>();
builder.Services.AddScoped<ILoteService, LoteService>();
builder.Services.AddScoped<IPerfilRepository, PerfilRepository>();
builder.Services.AddScoped<IPerfilService, PerfilService>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IMovimentacaoRepository, MovimentacaoRepository>();
builder.Services.AddScoped<IMovimentacaoService, MovimentacaoService>();
builder.Services.AddScoped<ISolicitacaoProducaoRepository, SolicitacaoProducaoRepository>();
builder.Services.AddScoped<ISolicitacaoProducaoService, SolicitacaoProducaoService>();
builder.Services.AddScoped<IFaseProducaoRepository, FaseProducaoRepository>();
builder.Services.AddScoped<IFaseProducaoService, FaseProducaoService>();
builder.Services.AddScoped<ICategoriaProdutoRepository, CategoriaProdutoRepository>();
builder.Services.AddScoped<ICategoriaProdutoService, CategoriaProdutoService>();
builder.Services.AddScoped<IUnidadeMedidaRepository, UnidadeMedidaRepository>();
builder.Services.AddScoped<IUnidadeMedidaService, UnidadeMedidaService>();
builder.Services.AddScoped<ITipoOrdemDeProducaoRepository, TipoOrdemDeProducaoRepository>();
builder.Services.AddScoped<ITipoOrdemDeProducaoService, TipoOrdemDeProducaoService>();
builder.Services.AddScoped<IOrdemDeProducaoRepository, OrdemDeProducaoRepository>();
builder.Services.AddScoped<IOrdemDeProducaoService, OrdemDeProducaoService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPdfReportService, PdfReportService>();

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var cfg = builder.Configuration;
    var accessKey = cfg["AWS__AccessKey"] ?? cfg["AWS:AccessKey"] ?? "";
    var secretKey = cfg["AWS__SecretKey"] ?? cfg["AWS:SecretKey"] ?? "";
    var region    = Amazon.RegionEndpoint.GetBySystemName(cfg["Aws:Region"] ?? "us-east-1");

    return string.IsNullOrEmpty(accessKey)
        ? new Amazon.S3.AmazonS3Client(region)
        : new Amazon.S3.AmazonS3Client(accessKey, secretKey, region);
});
builder.Services.AddScoped<IS3Service, S3Service>();
builder.Services.AddScoped<PermissionAuthorizationFilter>();
builder.Services.AddScoped<IAuthorizationHandler, PermissaoHandler>();
builder.Services.AddAuthorization();
builder.Services.AddAutoMapper(typeof(MappingProfiles));
builder.Services.AddScoped<IFichaTecnicaRepository, FichaTecnicaRepository>();
builder.Services.AddScoped<IFichaTecnicaService, FichaTecnicaService>();
builder.Services.AddScoped<IPedidoVendaRepository, PedidoVendaRepository>();
builder.Services.AddScoped<IPedidoVendaService, PedidoVendaService>();
builder.Services.AddScoped<IOrcamentoRepository, OrcamentoRepository>();
builder.Services.AddScoped<IOrcamentoService, OrcamentoService>();
builder.Services.AddScoped<IFormaPagamentoRepository, FormaPagamentoRepository>();
builder.Services.AddScoped<IFormaPagamentoService, FormaPagamentoService>();
builder.Services.AddScoped<IFinalidadeRepository, FinalidadeRepository>();
builder.Services.AddScoped<IFinalidadeService, FinalidadeService>();
builder.Services.AddScoped<ICondicaoPagamentoRepository, CondicaoPagamentoRepository>();
builder.Services.AddScoped<ICondicaoPagamentoService, CondicaoPagamentoService>();
builder.Services.AddScoped<IRoteiroProducaoRepository, RoteiroProducaoRepository>();
builder.Services.AddScoped<IRoteiroProducaoService, RoteiroProducaoService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ILogSistemaRepository, LogSistemaRepository>();
builder.Services.AddScoped<ILogSistemaService, LogSistemaService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IContaReceberRepository, ContaReceberRepository>();
builder.Services.AddScoped<IContaReceberService, ContaReceberService>();
builder.Services.AddScoped<IContaPagarRepository, ContaPagarRepository>();
builder.Services.AddScoped<IContaPagarService, ContaPagarService>();
builder.Services.AddScoped<IRegraRecorrenciaRepository, RegraRecorrenciaRepository>();
builder.Services.AddScoped<IPessoaFisicaRepository, PessoaFisicaRepository>();
builder.Services.AddScoped<IPessoaFisicaService, PessoaFisicaService>();
builder.Services.AddScoped<IPessoaJuridicaRepository, PessoaJuridicaRepository>();
builder.Services.AddScoped<IPessoaJuridicaService, PessoaJuridicaService>();
builder.Services.AddScoped<ICarteiraRepository, CarteiraRepository>();
builder.Services.AddScoped<ICarteiraService, CarteiraService>();
builder.Services.AddScoped<IMovimentacaoCarteiraRepository, MovimentacaoCarteiraRepository>();
builder.Services.AddScoped<IMovimentacaoCarteiraService, MovimentacaoCarteiraService>();
builder.Services.AddScoped<IInventarioRepository, InventarioRepository>();
builder.Services.AddScoped<IInventarioService, InventarioService>();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://187.127.2.114:5173", "https://www.valisys.com.br"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowSpecificOrigins", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;

                if (builder.Environment.IsDevelopment() && uri.Host == "localhost")
                    return true;

                return allowedOrigins.Contains(origin);
            })
            .WithHeaders("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With")
            .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var conn = dbContext.Database.GetDbConnection();
        await conn.OpenAsync();

        const string initialMigrationId = "20260623223725_AddRefreshTokens";

        bool hasHistory = false;
        bool hasExistingSchema = false;

        await using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '__EFMigrationsHistory')";
            hasHistory = (bool)(await cmd.ExecuteScalarAsync())!;
        }

        if (!hasHistory)
        {
            await using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Almoxarifados')";
                hasExistingSchema = (bool)(await cmd.ExecuteScalarAsync())!;
            }
        }

        if (hasExistingSchema && !hasHistory)
        {
            Console.WriteLine("Banco pré-existente detectado. Registrando migrations e criando tabelas faltantes...");

            await using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = """
                    CREATE TABLE "__EFMigrationsHistory" (
                        "MigrationId" character varying(150) NOT NULL,
                        "ProductVersion" character varying(32) NOT NULL,
                        CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
                    );
                    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                    VALUES ('20260623223725_AddRefreshTokens', '8.0.2');
                    CREATE TABLE IF NOT EXISTS "RefreshTokens" (
                        "Id" uuid NOT NULL,
                        "UsuarioId" uuid NOT NULL,
                        "Token" text NOT NULL,
                        "ExpiresAt" timestamp without time zone NOT NULL,
                        "IsRevoked" boolean NOT NULL,
                        "CriadoEm" timestamp without time zone NOT NULL,
                        CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id"),
                        CONSTRAINT "FK_RefreshTokens_Usuarios_UsuarioId" FOREIGN KEY ("UsuarioId")
                            REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
                    );
                    CREATE INDEX IF NOT EXISTS "IX_RefreshTokens_UsuarioId" ON "RefreshTokens" ("UsuarioId");
                    """;
                await cmd.ExecuteNonQueryAsync();
            }
        }
        else if (hasHistory)
        {
            // Histórico existe mas pode faltar a entry da migration inicial (bancos criados por
            // migrations antigas excluídas da compilação). Sem essa entrada, dotnet ef tenta
            // recriar todas as tabelas e falha com "relation already exists".
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = $"""
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ('{initialMigrationId}', '8.0.2')
                ON CONFLICT ("MigrationId") DO NOTHING
                """;
            await cmd.ExecuteNonQueryAsync();
        }

        await conn.CloseAsync();
        dbContext.Database.Migrate();
        Console.WriteLine("Banco de Dados migrado com sucesso!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($" Erro ao migrar banco: {ex.Message}");
    }
}

app.UseMiddleware<ErrorHandlingMiddleware>();

app.Use(async (ctx, next) =>
{
    ctx.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    ctx.Response.Headers.Append("X-Frame-Options", "DENY");
    ctx.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("MyAllowSpecificOrigins");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


static string Env(string key, string fallback = "") =>
    Environment.GetEnvironmentVariable(key) ?? fallback;

static void LoadDotEnv(string startDir)
{
    var candidates = new[]
    {
        Path.Combine(startDir, ".env"),
        Path.Combine(startDir, "..", ".env"),
    };
    var path = Array.Find(candidates, File.Exists);
    if (path is null) return;

    foreach (var line in File.ReadAllLines(path))
    {
        var t = line.Trim();
        if (t.Length == 0 || t[0] == '#') continue;
        var eq = t.IndexOf('=');
        if (eq < 1) continue;
        var k = t[..eq].Trim();
        var v = t[(eq + 1)..].Trim();
        if (Environment.GetEnvironmentVariable(k) is null)
            Environment.SetEnvironmentVariable(k, v);
    }
}
