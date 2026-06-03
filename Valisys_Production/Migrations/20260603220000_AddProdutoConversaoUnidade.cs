using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddProdutoConversaoUnidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UnidadeMedidaCompraId",
                table: "ProdutoFornecedores",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FatorConversao",
                table: "ProdutoFornecedores",
                type: "numeric",
                nullable: false,
                defaultValue: 1m);

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFornecedores_UnidadeMedidaCompraId",
                table: "ProdutoFornecedores",
                column: "UnidadeMedidaCompraId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProdutoFornecedores_UnidadesMedida_UnidadeMedidaCompraId",
                table: "ProdutoFornecedores",
                column: "UnidadeMedidaCompraId",
                principalTable: "UnidadesMedida",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProdutoFornecedores_UnidadesMedida_UnidadeMedidaCompraId",
                table: "ProdutoFornecedores");

            migrationBuilder.DropIndex(
                name: "IX_ProdutoFornecedores_UnidadeMedidaCompraId",
                table: "ProdutoFornecedores");

            migrationBuilder.DropColumn(name: "FatorConversao",        table: "ProdutoFornecedores");
            migrationBuilder.DropColumn(name: "UnidadeMedidaCompraId", table: "ProdutoFornecedores");
        }
    }
}
