using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLimiteCreditoETabelaPreco : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LimiteCredito");

            migrationBuilder.DropColumn(
                name: "LimiteCreditoId",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "TabelaPrecoId",
                table: "PedidosVenda");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LimiteCreditoId",
                table: "Pessoas",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TabelaPrecoId",
                table: "PedidosVenda",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "LimiteCredito",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PessoaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataConcessao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataProxRevisao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LimiteDisponivel = table.Column<decimal>(type: "numeric", nullable: false),
                    LimiteTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    RatingRisco = table.Column<int>(type: "integer", nullable: false),
                    StatusCredito = table.Column<int>(type: "integer", nullable: false),
                    ValorUtilizado = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LimiteCredito", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LimiteCredito_Pessoas_PessoaId",
                        column: x => x.PessoaId,
                        principalTable: "Pessoas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LimiteCredito_PessoaId",
                table: "LimiteCredito",
                column: "PessoaId",
                unique: true);
        }
    }
}
