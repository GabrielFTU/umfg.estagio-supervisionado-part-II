using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddFinalidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Finalidades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Finalidades", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Finalidades_Codigo",
                table: "Finalidades",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Finalidades_Nome",
                table: "Finalidades",
                column: "Nome",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Finalidades");
        }
    }
}
