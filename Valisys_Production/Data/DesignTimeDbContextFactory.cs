using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Valisys_Production.Data;
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        LoadDotEnv(Directory.GetCurrentDirectory());

        var dbUser = Env("DB_USER",   "postgres");
        var dbPass = Env("DB_PASSWORD", "");
        var dbName = Env("DB_NAME",   "ValisysProduction");
        var dbHost = Env("DB_HOST",   "localhost");
        var dbPort = Env("DB_PORT",   "5433");

        var connectionString =
            $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};Timeout=30;Command Timeout=30;";

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        var ctx = new ApplicationDbContext(options);

        EnsureInitialMigrationRegistered(connectionString);

        return ctx;
    }

    private static void EnsureInitialMigrationRegistered(string connectionString)
    {
        const string migrationId = "20260628204025_InitialCreate";
        try
        {
            using var conn = new Npgsql.NpgsqlConnection(connectionString);
            conn.Open();

            using var checkCmd = conn.CreateCommand();
            checkCmd.CommandText = """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = '__EFMigrationsHistory'
                ) AND EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'Almoxarifados'
                )
                """;
            var schemaExists = (bool)checkCmd.ExecuteScalar()!;
            if (!schemaExists) return;

            using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = $"""
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ('{migrationId}', '8.0.2')
                ON CONFLICT ("MigrationId") DO NOTHING
                """;
            insertCmd.ExecuteNonQuery();
        }
        catch { }
    }

    private static string Env(string key, string fallback = "") =>
        Environment.GetEnvironmentVariable(key) ?? fallback;

    private static void LoadDotEnv(string startDir)
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
}
