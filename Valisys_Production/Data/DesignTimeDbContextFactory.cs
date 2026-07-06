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

        return new ApplicationDbContext(options);
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
