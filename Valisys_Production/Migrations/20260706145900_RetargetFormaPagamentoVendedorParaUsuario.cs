using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class RetargetFormaPagamentoVendedorParaUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormaPagamentoVendedores_Pessoas_VendedorId",
                table: "FormaPagamentoVendedores");

            // Vínculos antigos referenciavam Pessoa; não têm correspondência em Usuarios.
            migrationBuilder.Sql(@"DELETE FROM ""FormaPagamentoVendedores"" v
                WHERE NOT EXISTS (SELECT 1 FROM ""Usuarios"" u WHERE u.""Id"" = v.""VendedorId"");");

            migrationBuilder.AddForeignKey(
                name: "FK_FormaPagamentoVendedores_Usuarios_VendedorId",
                table: "FormaPagamentoVendedores",
                column: "VendedorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormaPagamentoVendedores_Usuarios_VendedorId",
                table: "FormaPagamentoVendedores");

            migrationBuilder.AddForeignKey(
                name: "FK_FormaPagamentoVendedores_Pessoas_VendedorId",
                table: "FormaPagamentoVendedores",
                column: "VendedorId",
                principalTable: "Pessoas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
