using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixCondicaoPagamentoOrcamentoDrift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orcamentos_Usuarios_RepresentanteId",
                table: "Orcamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidosVenda_Usuarios_RepresentanteId",
                table: "PedidosVenda");

            migrationBuilder.AddColumn<int>(
                name: "DiaVencimento",
                table: "CondicoesPagamento",
                type: "integer",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orcamentos_Pessoas_RepresentanteId",
                table: "Orcamentos",
                column: "RepresentanteId",
                principalTable: "Pessoas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PedidosVenda_Pessoas_RepresentanteId",
                table: "PedidosVenda",
                column: "RepresentanteId",
                principalTable: "Pessoas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orcamentos_Pessoas_RepresentanteId",
                table: "Orcamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidosVenda_Pessoas_RepresentanteId",
                table: "PedidosVenda");

            migrationBuilder.DropColumn(
                name: "DiaVencimento",
                table: "CondicoesPagamento");

            migrationBuilder.AddForeignKey(
                name: "FK_Orcamentos_Usuarios_RepresentanteId",
                table: "Orcamentos",
                column: "RepresentanteId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PedidosVenda_Usuarios_RepresentanteId",
                table: "PedidosVenda",
                column: "RepresentanteId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
