using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOpcoesNaoUtilizadasDeDeposito : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ControlaMultiplosLocais",
                table: "Depositos");

            migrationBuilder.DropColumn(
                name: "ControlaQualidade2a",
                table: "Depositos");

            migrationBuilder.DropColumn(
                name: "DepositoPadraoRequisicoes",
                table: "Depositos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ControlaMultiplosLocais",
                table: "Depositos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ControlaQualidade2a",
                table: "Depositos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DepositoPadraoRequisicoes",
                table: "Depositos",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
