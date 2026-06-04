using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class SetAdminPerfilForValisysBrUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Usuarios"
                SET "PerfilId" = 'c0de0000-0000-0000-0000-000000000001'
                WHERE LOWER("Email") = LOWER('admin@valisys.com.br');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
