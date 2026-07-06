using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminPasswordSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000000"),
                column: "SenhaHash",
                value: "$2a$12$ANrNWbumb63JFxo..Ar6A.3iQJhEqJUqR5kqjklRZoZHs3uM7C4k2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000000"),
                column: "SenhaHash",
                value: "$2a$12$ceV2TtMQV.UXqYGXoyMt.eV9s2YcTh0SVykcjMPxxDxjci9hoYzeG");
        }
    }
}
