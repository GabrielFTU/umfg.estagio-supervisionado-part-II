using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class RetargetRepresentanteEVendedorParaPessoa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormaPagamentoVendedores_Usuarios_VendedorId",
                table: "FormaPagamentoVendedores");

            migrationBuilder.DropForeignKey(
                name: "FK_Orcamentos_Usuarios_RepresentanteId",
                table: "Orcamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidosVenda_Usuarios_RepresentanteId",
                table: "PedidosVenda");

            // RepresentanteId apontava para Usuario; reatribui para uma Pessoa com a flag
            // Vendedor (bit 8), já que registros existentes não têm correspondência em Pessoas.
            migrationBuilder.Sql(@"
                UPDATE ""PedidosVenda"" SET ""RepresentanteId"" = '2d272106-e31c-45eb-8cb8-ecdd6c14bee9'
                WHERE ""RepresentanteId"" NOT IN (SELECT ""Id"" FROM ""Pessoas"");
                UPDATE ""Orcamentos"" SET ""RepresentanteId"" = '2d272106-e31c-45eb-8cb8-ecdd6c14bee9'
                WHERE ""RepresentanteId"" NOT IN (SELECT ""Id"" FROM ""Pessoas"");
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_FormaPagamentoVendedores_Pessoas_VendedorId",
                table: "FormaPagamentoVendedores",
                column: "VendedorId",
                principalTable: "Pessoas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_FormaPagamentoVendedores_Pessoas_VendedorId",
                table: "FormaPagamentoVendedores");

            migrationBuilder.DropForeignKey(
                name: "FK_Orcamentos_Pessoas_RepresentanteId",
                table: "Orcamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidosVenda_Pessoas_RepresentanteId",
                table: "PedidosVenda");

            migrationBuilder.AddForeignKey(
                name: "FK_FormaPagamentoVendedores_Usuarios_VendedorId",
                table: "FormaPagamentoVendedores",
                column: "VendedorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
