using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddFormaPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FormasPagamento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    PrazoDias = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_FormasPagamento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormaPagamentoVendedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormaPagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    VendedorId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_FormaPagamentoVendedores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormaPagamentoVendedores_FormasPagamento_FormaPagamentoId",
                        column: x => x.FormaPagamentoId,
                        principalTable: "FormasPagamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormaPagamentoVendedores_Pessoas_VendedorId",
                        column: x => x.VendedorId,
                        principalTable: "Pessoas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormaPagamentoVendedores_FormaPagamentoId_VendedorId",
                table: "FormaPagamentoVendedores",
                columns: new[] { "FormaPagamentoId", "VendedorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormaPagamentoVendedores_VendedorId",
                table: "FormaPagamentoVendedores",
                column: "VendedorId");

            migrationBuilder.CreateIndex(
                name: "IX_FormasPagamento_Codigo",
                table: "FormasPagamento",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormaPagamentoVendedores");

            migrationBuilder.DropTable(
                name: "FormasPagamento");
        }
    }
}
