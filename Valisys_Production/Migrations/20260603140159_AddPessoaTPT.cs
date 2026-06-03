using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddPessoaTPT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContasReceber_Pessoa_PessoaId",
                table: "ContasReceber");

            migrationBuilder.DropForeignKey(
                name: "FK_LimiteCredito_Pessoa_PessoaId",
                table: "LimiteCredito");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Pessoa",
                table: "Pessoa");

            migrationBuilder.DropColumn(
                name: "Documento",
                table: "Pessoa");

            migrationBuilder.RenameTable(
                name: "Pessoa",
                newName: "Pessoas");

            migrationBuilder.RenameColumn(
                name: "NomeRazaoSocial",
                table: "Pessoas",
                newName: "Nome");

            migrationBuilder.RenameColumn(
                name: "ApelidoNomeFantasia",
                table: "Pessoas",
                newName: "Observacoes");

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pessoas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "LimiteCreditoId",
                table: "Pessoas",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pessoas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Celular",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Bairro",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Cep",
                table: "Pessoas",
                type: "character varying(9)",
                maxLength: 9,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Cidade",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_CodigoIbge",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Complemento",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Logradouro",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Numero",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco_Uf",
                table: "Pessoas",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeFantasia",
                table: "Pessoas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PapelPessoa",
                table: "Pessoas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pessoas",
                table: "Pessoas",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "PessoasFisicas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Cpf = table.Column<string>(type: "text", nullable: false),
                    Rg = table.Column<string>(type: "text", nullable: true),
                    OrgaoExpedidor = table.Column<string>(type: "text", nullable: true),
                    DataNascimento = table.Column<DateOnly>(type: "date", nullable: true),
                    Sexo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PessoasFisicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PessoasFisicas_Pessoas_Id",
                        column: x => x.Id,
                        principalTable: "Pessoas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PessoasJuridicas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Cnpj = table.Column<string>(type: "text", nullable: false),
                    InscricaoEstadual = table.Column<string>(type: "text", nullable: true),
                    InscricaoMunicipal = table.Column<string>(type: "text", nullable: true),
                    ResponsavelNome = table.Column<string>(type: "text", nullable: true),
                    ResponsavelCpf = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PessoasJuridicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PessoasJuridicas_Pessoas_Id",
                        column: x => x.Id,
                        principalTable: "Pessoas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pessoas_PapelPessoa",
                table: "Pessoas",
                column: "PapelPessoa");

            migrationBuilder.CreateIndex(
                name: "IX_PessoasFisicas_Cpf",
                table: "PessoasFisicas",
                column: "Cpf",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PessoasJuridicas_Cnpj",
                table: "PessoasJuridicas",
                column: "Cnpj",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ContasReceber_Pessoas_PessoaId",
                table: "ContasReceber",
                column: "PessoaId",
                principalTable: "Pessoas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LimiteCredito_Pessoas_PessoaId",
                table: "LimiteCredito",
                column: "PessoaId",
                principalTable: "Pessoas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContasReceber_Pessoas_PessoaId",
                table: "ContasReceber");

            migrationBuilder.DropForeignKey(
                name: "FK_LimiteCredito_Pessoas_PessoaId",
                table: "LimiteCredito");

            migrationBuilder.DropTable(
                name: "PessoasFisicas");

            migrationBuilder.DropTable(
                name: "PessoasJuridicas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Pessoas",
                table: "Pessoas");

            migrationBuilder.DropIndex(
                name: "IX_Pessoas_PapelPessoa",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Celular",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Bairro",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Cep",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Cidade",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_CodigoIbge",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Complemento",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Logradouro",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Numero",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "Endereco_Uf",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "NomeFantasia",
                table: "Pessoas");

            migrationBuilder.DropColumn(
                name: "PapelPessoa",
                table: "Pessoas");

            migrationBuilder.RenameTable(
                name: "Pessoas",
                newName: "Pessoa");

            migrationBuilder.RenameColumn(
                name: "Observacoes",
                table: "Pessoa",
                newName: "ApelidoNomeFantasia");

            migrationBuilder.RenameColumn(
                name: "Nome",
                table: "Pessoa",
                newName: "NomeRazaoSocial");

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pessoa",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "LimiteCreditoId",
                table: "Pessoa",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pessoa",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Documento",
                table: "Pessoa",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pessoa",
                table: "Pessoa",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ContasReceber_Pessoa_PessoaId",
                table: "ContasReceber",
                column: "PessoaId",
                principalTable: "Pessoa",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LimiteCredito_Pessoa_PessoaId",
                table: "LimiteCredito",
                column: "PessoaId",
                principalTable: "Pessoa",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
