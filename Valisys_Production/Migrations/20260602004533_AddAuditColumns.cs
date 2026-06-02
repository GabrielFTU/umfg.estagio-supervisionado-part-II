using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SolicitacoesProducao_TiposDeOrdemDeProducao_TipoOrdemDeProd~",
                table: "SolicitacoesProducao");

            migrationBuilder.DropForeignKey(
                name: "FK_SolicitacoesProducao_Usuarios_UsuarioAprovacaoId",
                table: "SolicitacoesProducao");

            migrationBuilder.DropIndex(
                name: "IX_CategoriasProduto_Codigo",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "CategoriasProduto");

            migrationBuilder.RenameColumn(
                name: "statusLote",
                table: "Lotes",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "TipoDocumento",
                table: "Fornecedores",
                newName: "PapelPessoa");

            migrationBuilder.RenameColumn(
                name: "DataCriacao",
                table: "FichasTecnicas",
                newName: "DataCadastro");

            migrationBuilder.RenameColumn(
                name: "Ativa",
                table: "FichasTecnicas",
                newName: "Ativo");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Usuarios",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Usuarios",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Usuarios",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Usuarios",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Sigla",
                table: "UnidadesMedida",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "UnidadesMedida",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "UnidadesMedida",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "UnidadesMedida",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "UnidadesMedida",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "UnidadesMedida",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "UnidadesMedida",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "UnidadesMedida",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "TiposDeOrdemDeProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "TiposDeOrdemDeProducao",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "TiposDeOrdemDeProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "TiposDeOrdemDeProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "TiposDeOrdemDeProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "TiposDeOrdemDeProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "TiposDeOrdemDeProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "TiposDeOrdemDeProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "TiposDeOrdemDeProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UsuarioAprovacaoId",
                table: "SolicitacoesProducao",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "TipoOrdemDeProducaoId",
                table: "SolicitacoesProducao",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "SolicitacoesProducao",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<Guid>(
                name: "EncarregadoId",
                table: "SolicitacoesProducao",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "SolicitacoesProducao",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "SolicitacoesProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "SolicitacoesProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "SolicitacoesProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "SolicitacoesProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "SolicitacoesProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "SolicitacoesProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "SolicitacaoProducaoItens",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "SolicitacaoProducaoItens",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "SolicitacaoProducaoItens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "SolicitacaoProducaoItens",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "SolicitacaoProducaoItens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "SolicitacaoProducaoItens",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "SolicitacaoProducaoItens",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Versao",
                table: "RoteirosProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "RoteirosProducao",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "RoteirosProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "RoteirosProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "RoteirosProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "RoteirosProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "RoteirosProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "RoteirosProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "RoteirosProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Instrucoes",
                table: "RoteiroProducaoEtapas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "RoteiroProducaoEtapas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "RoteiroProducaoEtapas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "RoteiroProducaoEtapas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "RoteiroProducaoEtapas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "RoteiroProducaoEtapas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "RoteiroProducaoEtapas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "RoteiroProducaoEtapas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Produtos",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Produtos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Produtos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.Sql("ALTER TABLE \"Produtos\" ALTER COLUMN \"CodigoInternoProduto\" TYPE integer USING 0");

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Produtos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Produtos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Produtos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstoqueMinimo",
                table: "Produtos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Perfis",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Acessos",
                table: "Perfis",
                type: "text",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Perfis",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Perfis",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Perfis",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Perfis",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "Perfis",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Perfis",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "OrdensDeProducao",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoOrdem",
                table: "OrdensDeProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "OrdensDeProducao",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "OrdensDeProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "OrdensDeProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "OrdensDeProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "OrdensDeProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "OrdensDeProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "OrdensDeProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrdemDeProducaoId",
                table: "Movimentacoes",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Movimentacoes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Movimentacoes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Movimentacoes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Movimentacoes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Movimentacoes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Movimentacoes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "Movimentacoes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Movimentacoes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Lotes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Lotes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoLote",
                table: "Lotes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Lotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Lotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Lotes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Lotes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Lotes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "Lotes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Lotes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Modulo",
                table: "LogsSistema",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Detalhes",
                table: "LogsSistema",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<string>(
                name: "Acao",
                table: "LogsSistema",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "LogsSistema",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "LogsSistema",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "LogsSistema",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "LogsSistema",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "LogsSistema",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "LogsSistema",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "LogsSistema",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Fornecedores",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(15)",
                oldMaxLength: 15);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Fornecedores",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Fornecedores",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Endereco",
                table: "Fornecedores",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Fornecedores",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Documento",
                table: "Fornecedores",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Fornecedores",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Fornecedores",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cnpj",
                table: "Fornecedores",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Fornecedores",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Fornecedores",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Fornecedores",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeFantasia",
                table: "Fornecedores",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RazaoSocial",
                table: "Fornecedores",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "FichaTecnicaItens",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "FichaTecnicaItens",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "FichaTecnicaItens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "FichaTecnicaItens",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "FichaTecnicaItens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "FichaTecnicaItens",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "FichaTecnicaItens",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Versao",
                table: "FichasTecnicas",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "FichasTecnicas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoFicha",
                table: "FichasTecnicas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "FichasTecnicas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "FichasTecnicas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "FichasTecnicas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "FichasTecnicas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "FichasTecnicas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "FasesProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "FasesProducao",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "FasesProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "FasesProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "FasesProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "FasesProducao",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "FasesProducao",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "FasesProducao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "CategoriasProduto",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "CategoriasProduto",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "CategoriasProduto",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "CategoriasProduto",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodigoInterno",
                table: "CategoriasProduto",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "CategoriasProduto",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "CategoriasProduto",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCadastro",
                table: "CategoriasProduto",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "CategoriasProduto",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Responsavel",
                table: "Almoxarifados",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Almoxarifados",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Localizacao",
                table: "Almoxarifados",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Almoxarifados",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Almoxarifados",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Contato",
                table: "Almoxarifados",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadoEm",
                table: "Almoxarifados",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AtualizadoPor",
                table: "Almoxarifados",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Codigo",
                table: "Almoxarifados",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriadoEm",
                table: "Almoxarifados",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Almoxarifados",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DesativadoEm",
                table: "Almoxarifados",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContasPagar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    NumeroDocumento = table.Column<string>(type: "text", nullable: true),
                    FornecedorId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_ContasPagar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContasPagar_Fornecedores_FornecedorId",
                        column: x => x.FornecedorId,
                        principalTable: "Fornecedores",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Deposito",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AlmoxarifadoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoIdentificador = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Deposito", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deposito_Almoxarifados_AlmoxarifadoId",
                        column: x => x.AlmoxarifadoId,
                        principalTable: "Almoxarifados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PedidoVenda",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    ClienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    RepresentanteId = table.Column<Guid>(type: "uuid", nullable: false),
                    FinalidadePedidoId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormaPagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TabelaPrecoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataPrevisaoEntrega = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Desconto = table.Column<decimal>(type: "numeric", nullable: false),
                    ObservacaoInterna = table.Column<string>(type: "text", nullable: true),
                    ObservacaoExterna = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_PedidoVenda", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pessoa",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NomeRazaoSocial = table.Column<string>(type: "text", nullable: false),
                    ApelidoNomeFantasia = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Documento = table.Column<string>(type: "text", nullable: false),
                    Telefone = table.Column<string>(type: "text", nullable: false),
                    LimiteCreditoId = table.Column<Guid>(type: "uuid", nullable: false),
                    StatusCredito = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_Pessoa", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParcelasPagar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContaPagarId = table.Column<Guid>(type: "uuid", nullable: false),
                    NumeroParcela = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: true),
                    Juros = table.Column<decimal>(type: "numeric", nullable: true),
                    Multa = table.Column<decimal>(type: "numeric", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FormaPagamento = table.Column<int>(type: "integer", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ParcelasPagar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParcelasPagar_ContasPagar_ContaPagarId",
                        column: x => x.ContaPagarId,
                        principalTable: "ContasPagar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ItemPedido",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PedidoVendaId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    DescontoUnitario = table.Column<decimal>(type: "numeric", nullable: false),
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
                    table.PrimaryKey("PK_ItemPedido", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemPedido_PedidoVenda_PedidoVendaId",
                        column: x => x.PedidoVendaId,
                        principalTable: "PedidoVenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContasReceber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    PessoaId = table.Column<Guid>(type: "uuid", nullable: true),
                    PedidoVendaId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_ContasReceber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContasReceber_PedidoVenda_PedidoVendaId",
                        column: x => x.PedidoVendaId,
                        principalTable: "PedidoVenda",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ContasReceber_Pessoa_PessoaId",
                        column: x => x.PessoaId,
                        principalTable: "Pessoa",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LimiteCredito",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    PessoaId = table.Column<Guid>(type: "uuid", nullable: false),
                    LimiteTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorUtilizado = table.Column<decimal>(type: "numeric", nullable: false),
                    LimiteDisponivel = table.Column<decimal>(type: "numeric", nullable: false),
                    RatingRisco = table.Column<int>(type: "integer", nullable: false),
                    StatusCredito = table.Column<int>(type: "integer", nullable: false),
                    DataConcessao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataProxRevisao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_LimiteCredito", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LimiteCredito_Pessoa_PessoaId",
                        column: x => x.PessoaId,
                        principalTable: "Pessoa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ParcelasReceber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContaReceberId = table.Column<Guid>(type: "uuid", nullable: false),
                    NumeroParcela = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: true),
                    Juros = table.Column<decimal>(type: "numeric", nullable: true),
                    Multa = table.Column<decimal>(type: "numeric", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FormaPagamento = table.Column<int>(type: "integer", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_ParcelasReceber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParcelasReceber_ContasReceber_ContaReceberId",
                        column: x => x.ContaReceberId,
                        principalTable: "ContasReceber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Almoxarifados",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000009"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "Codigo", "CriadoEm", "CriadoPor", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 0, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null });

            migrationBuilder.UpdateData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000001"),
                columns: new[] { "Acessos", "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { "", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.InsertData(
                table: "TiposDeOrdemDeProducao",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "AtualizadoPor", "Codigo", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Descricao", "Nome" },
                values: new object[] { new Guid("c0de0000-0000-0000-0000-000000000008"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "NOR", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ordem de Produção Padrão", "Normal" });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000002"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000003"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000012"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000020"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000021"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000022"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000023"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000024"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000031"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000032"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000040"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000041"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000042"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000050"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000051"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000052"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000060"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000061"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000070"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000071"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "UnidadesMedida",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000099"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000000"),
                columns: new[] { "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DesativadoEm" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null });

            migrationBuilder.CreateIndex(
                name: "IX_CategoriasProduto_CodigoInterno",
                table: "CategoriasProduto",
                column: "CodigoInterno",
                unique: true,
                filter: "\"CodigoInterno\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_FornecedorId",
                table: "ContasPagar",
                column: "FornecedorId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_PedidoVendaId",
                table: "ContasReceber",
                column: "PedidoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_PessoaId",
                table: "ContasReceber",
                column: "PessoaId");

            migrationBuilder.CreateIndex(
                name: "IX_Deposito_AlmoxarifadoId",
                table: "Deposito",
                column: "AlmoxarifadoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemPedido_PedidoVendaId",
                table: "ItemPedido",
                column: "PedidoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_LimiteCredito_PessoaId",
                table: "LimiteCredito",
                column: "PessoaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasPagar_ContaPagarId",
                table: "ParcelasPagar",
                column: "ContaPagarId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasReceber_ContaReceberId",
                table: "ParcelasReceber",
                column: "ContaReceberId");

            migrationBuilder.AddForeignKey(
                name: "FK_SolicitacoesProducao_TiposDeOrdemDeProducao_TipoOrdemDeProd~",
                table: "SolicitacoesProducao",
                column: "TipoOrdemDeProducaoId",
                principalTable: "TiposDeOrdemDeProducao",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SolicitacoesProducao_Usuarios_UsuarioAprovacaoId",
                table: "SolicitacoesProducao",
                column: "UsuarioAprovacaoId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SolicitacoesProducao_TiposDeOrdemDeProducao_TipoOrdemDeProd~",
                table: "SolicitacoesProducao");

            migrationBuilder.DropForeignKey(
                name: "FK_SolicitacoesProducao_Usuarios_UsuarioAprovacaoId",
                table: "SolicitacoesProducao");

            migrationBuilder.DropTable(
                name: "Deposito");

            migrationBuilder.DropTable(
                name: "ItemPedido");

            migrationBuilder.DropTable(
                name: "LimiteCredito");

            migrationBuilder.DropTable(
                name: "ParcelasPagar");

            migrationBuilder.DropTable(
                name: "ParcelasReceber");

            migrationBuilder.DropTable(
                name: "ContasPagar");

            migrationBuilder.DropTable(
                name: "ContasReceber");

            migrationBuilder.DropTable(
                name: "PedidoVenda");

            migrationBuilder.DropTable(
                name: "Pessoa");

            migrationBuilder.DropIndex(
                name: "IX_CategoriasProduto_CodigoInterno",
                table: "CategoriasProduto");

            migrationBuilder.DeleteData(
                table: "TiposDeOrdemDeProducao",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000008"));

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "UnidadesMedida");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "UnidadesMedida");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "UnidadesMedida");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "UnidadesMedida");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "UnidadesMedida");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "UnidadesMedida");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "TiposDeOrdemDeProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "TiposDeOrdemDeProducao");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "TiposDeOrdemDeProducao");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "TiposDeOrdemDeProducao");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "TiposDeOrdemDeProducao");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "TiposDeOrdemDeProducao");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "SolicitacoesProducao");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "SolicitacaoProducaoItens");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "RoteirosProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "RoteirosProducao");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "RoteirosProducao");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "RoteirosProducao");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "RoteirosProducao");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "RoteirosProducao");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "RoteiroProducaoEtapas");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "EstoqueMinimo",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Perfis");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Perfis");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Perfis");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Perfis");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "Perfis");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Perfis");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Lotes");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "LogsSistema");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "Cnpj",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "NomeFantasia",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "RazaoSocial",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "FichaTecnicaItens");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "FichasTecnicas");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "FichasTecnicas");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "FichasTecnicas");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "FichasTecnicas");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "FichasTecnicas");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "FasesProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "FasesProducao");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "FasesProducao");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "FasesProducao");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "FasesProducao");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "FasesProducao");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "CodigoInterno",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "DataCadastro",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "CategoriasProduto");

            migrationBuilder.DropColumn(
                name: "AtualizadoEm",
                table: "Almoxarifados");

            migrationBuilder.DropColumn(
                name: "AtualizadoPor",
                table: "Almoxarifados");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "Almoxarifados");

            migrationBuilder.DropColumn(
                name: "CriadoEm",
                table: "Almoxarifados");

            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Almoxarifados");

            migrationBuilder.DropColumn(
                name: "DesativadoEm",
                table: "Almoxarifados");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Lotes",
                newName: "statusLote");

            migrationBuilder.RenameColumn(
                name: "PapelPessoa",
                table: "Fornecedores",
                newName: "TipoDocumento");

            migrationBuilder.RenameColumn(
                name: "DataCadastro",
                table: "FichasTecnicas",
                newName: "DataCriacao");

            migrationBuilder.RenameColumn(
                name: "Ativo",
                table: "FichasTecnicas",
                newName: "Ativa");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Usuarios",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Usuarios",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Sigla",
                table: "UnidadesMedida",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "UnidadesMedida",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "TiposDeOrdemDeProducao",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "TiposDeOrdemDeProducao",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "TiposDeOrdemDeProducao",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "UsuarioAprovacaoId",
                table: "SolicitacoesProducao",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TipoOrdemDeProducaoId",
                table: "SolicitacoesProducao",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "SolicitacoesProducao",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "EncarregadoId",
                table: "SolicitacoesProducao",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Versao",
                table: "RoteirosProducao",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "RoteirosProducao",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "RoteirosProducao",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Instrucoes",
                table: "RoteiroProducaoEtapas",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Produtos",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Produtos",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Produtos",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "CodigoInternoProduto",
                table: "Produtos",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Perfis",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<string>>(
                name: "Acessos",
                table: "Perfis",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "OrdensDeProducao",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoOrdem",
                table: "OrdensDeProducao",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "OrdemDeProducaoId",
                table: "Movimentacoes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Movimentacoes",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Lotes",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Lotes",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoLote",
                table: "Lotes",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Modulo",
                table: "LogsSistema",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Detalhes",
                table: "LogsSistema",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Acao",
                table: "LogsSistema",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Fornecedores",
                type: "character varying(15)",
                maxLength: 15,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Fornecedores",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Fornecedores",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Endereco",
                table: "Fornecedores",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Fornecedores",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Documento",
                table: "Fornecedores",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Versao",
                table: "FichasTecnicas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "FichasTecnicas",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoFicha",
                table: "FichasTecnicas",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "FasesProducao",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "FasesProducao",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "CategoriasProduto",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "CategoriasProduto",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "CategoriasProduto",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Responsavel",
                table: "Almoxarifados",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Almoxarifados",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Localizacao",
                table: "Almoxarifados",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Almoxarifados",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Almoxarifados",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Contato",
                table: "Almoxarifados",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000001"),
                column: "Acessos",
                value: new List<string>());

            migrationBuilder.CreateIndex(
                name: "IX_CategoriasProduto_Codigo",
                table: "CategoriasProduto",
                column: "Codigo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SolicitacoesProducao_TiposDeOrdemDeProducao_TipoOrdemDeProd~",
                table: "SolicitacoesProducao",
                column: "TipoOrdemDeProducaoId",
                principalTable: "TiposDeOrdemDeProducao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SolicitacoesProducao_Usuarios_UsuarioAprovacaoId",
                table: "SolicitacoesProducao",
                column: "UsuarioAprovacaoId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
