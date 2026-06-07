using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddCondicaoPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CondicoesPagamento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    NumeroParcelas = table.Column<int>(type: "integer", nullable: false),
                    DiasParaPrimeiroVencimento = table.Column<int>(type: "integer", nullable: false),
                    DiastEntreParcelas = table.Column<int>(type: "integer", nullable: false),
                    VencimentoDiaFixo = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_CondicoesPagamento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParcelasCondicao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CondicaoPagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    NumeroDias = table.Column<int>(type: "integer", nullable: false),
                    Percentual = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParcelasCondicao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParcelasCondicao_CondicoesPagamento_CondicaoPagamentoId",
                        column: x => x.CondicaoPagamentoId,
                        principalTable: "CondicoesPagamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CondicoesPagamento_Codigo",
                table: "CondicoesPagamento",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CondicoesPagamento_Nome",
                table: "CondicoesPagamento",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasCondicao_CondicaoPagamentoId",
                table: "ParcelasCondicao",
                column: "CondicaoPagamentoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParcelasCondicao");

            migrationBuilder.DropTable(
                name: "CondicoesPagamento");
        }
    }
}
