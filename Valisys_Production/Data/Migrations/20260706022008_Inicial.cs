using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Valisys_Production.Data.Migrations
{
    /// <inheritdoc />
    public partial class Inicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "conta_pagar_codigo_seq");

            migrationBuilder.CreateSequence(
                name: "conta_receber_codigo_seq");

            migrationBuilder.CreateTable(
                name: "Almoxarifados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Localizacao = table.Column<string>(type: "text", nullable: false),
                    Responsavel = table.Column<string>(type: "text", nullable: false),
                    Contato = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Almoxarifados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Carteiras",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoBanco = table.Column<string>(type: "text", nullable: false),
                    NomeBanco = table.Column<string>(type: "text", nullable: false),
                    Titular = table.Column<string>(type: "text", nullable: false),
                    SaldoInicial = table.Column<decimal>(type: "numeric", nullable: false),
                    SaldoAtual = table.Column<decimal>(type: "numeric", nullable: false),
                    DataHoraSaldoInicial = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carteiras", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CategoriasProduto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoInterno = table.Column<string>(type: "text", nullable: true),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriasProduto", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CondicoesPagamento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    NumeroParcelas = table.Column<int>(type: "integer", nullable: false),
                    DiasParaPrimeiroVencimento = table.Column<int>(type: "integer", nullable: false),
                    DiasEntreParcelas = table.Column<int>(type: "integer", nullable: false),
                    VencimentoDiaFixo = table.Column<bool>(type: "boolean", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CondicoesPagamento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FasesProducao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    TempoPadraoDias = table.Column<int>(type: "integer", nullable: false),
                    TipoFase = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FasesProducao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Finalidades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Finalidades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormasPagamento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormasPagamento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fornecedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    NomeFantasia = table.Column<string>(type: "text", nullable: true),
                    RazaoSocial = table.Column<string>(type: "text", nullable: true),
                    Cnpj = table.Column<string>(type: "text", nullable: true),
                    Documento = table.Column<string>(type: "text", nullable: false),
                    PapelPessoa = table.Column<int>(type: "integer", nullable: false),
                    Endereco = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Telefone = table.Column<string>(type: "text", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fornecedores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Perfis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Acessos = table.Column<string>(type: "text", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perfis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pessoas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    NomeFantasia = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Telefone = table.Column<string>(type: "text", nullable: true),
                    Celular = table.Column<string>(type: "text", nullable: true),
                    Endereco_Cep = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: true),
                    Endereco_Logradouro = table.Column<string>(type: "text", nullable: true),
                    Endereco_Numero = table.Column<string>(type: "text", nullable: true),
                    Endereco_Complemento = table.Column<string>(type: "text", nullable: true),
                    Endereco_Bairro = table.Column<string>(type: "text", nullable: true),
                    Endereco_Cidade = table.Column<string>(type: "text", nullable: true),
                    Endereco_Uf = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                    Endereco_CodigoIbge = table.Column<string>(type: "text", nullable: true),
                    PapelPessoa = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    StatusCredito = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pessoas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegrasRecorrencia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Frequencia = table.Column<int>(type: "integer", nullable: false),
                    NumeroOcorrencias = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegrasRecorrencia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposDeOrdemDeProducao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDeOrdemDeProducao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnidadesMedida",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Sigla = table.Column<string>(type: "text", nullable: false),
                    Grandeza = table.Column<int>(type: "integer", nullable: false),
                    FatorConversao = table.Column<decimal>(type: "numeric", nullable: false),
                    EhUnidadeBase = table.Column<bool>(type: "boolean", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesMedida", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Depositos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AlmoxarifadoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoIdentificador = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    ControlaLote = table.Column<bool>(type: "boolean", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depositos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Depositos_Almoxarifados_AlmoxarifadoId",
                        column: x => x.AlmoxarifadoId,
                        principalTable: "Almoxarifados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    SenhaHash = table.Column<string>(type: "text", nullable: false),
                    PerfilId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Perfis_PerfilId",
                        column: x => x.PerfilId,
                        principalTable: "Perfis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormaPagamentoVendedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormaPagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    VendedorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
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

            migrationBuilder.CreateTable(
                name: "ContasPagar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    NumeroDocumento = table.Column<string>(type: "text", nullable: true),
                    FornecedorId = table.Column<Guid>(type: "uuid", nullable: true),
                    FormaPagamentoId = table.Column<Guid>(type: "uuid", nullable: true),
                    RegraRecorrenciaId = table.Column<Guid>(type: "uuid", nullable: true),
                    NumeroOcorrenciaRecorrencia = table.Column<int>(type: "integer", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContasPagar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContasPagar_FormasPagamento_FormaPagamentoId",
                        column: x => x.FormaPagamentoId,
                        principalTable: "FormasPagamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContasPagar_Pessoas_FornecedorId",
                        column: x => x.FornecedorId,
                        principalTable: "Pessoas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ContasPagar_RegrasRecorrencia_RegraRecorrenciaId",
                        column: x => x.RegraRecorrenciaId,
                        principalTable: "RegrasRecorrencia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Produtos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoInternoProduto = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    ImagemUrl = table.Column<string>(type: "text", nullable: true),
                    Sku = table.Column<string>(type: "text", nullable: true),
                    Classificacao = table.Column<int>(type: "integer", nullable: false),
                    ControlarPorLote = table.Column<bool>(type: "boolean", nullable: false),
                    EstoqueMinimo = table.Column<decimal>(type: "numeric", nullable: false),
                    Ncm = table.Column<string>(type: "text", nullable: true),
                    TipoItem = table.Column<int>(type: "integer", nullable: true),
                    OrigemMercadoria = table.Column<int>(type: "integer", nullable: false),
                    CustoPadrao = table.Column<decimal>(type: "numeric", nullable: false),
                    CustoUltimaCompra = table.Column<decimal>(type: "numeric", nullable: false),
                    DataUltimaCompra = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UnidadeMedidaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoriaProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DisponivelParaVenda = table.Column<bool>(type: "boolean", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produtos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Produtos_CategoriasProduto_CategoriaProdutoId",
                        column: x => x.CategoriaProdutoId,
                        principalTable: "CategoriasProduto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Produtos_UnidadesMedida_UnidadeMedidaId",
                        column: x => x.UnidadeMedidaId,
                        principalTable: "UnidadesMedida",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inventarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    DepositoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TipoContagem = table.Column<int>(type: "integer", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DataAbertura = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataFinalizacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UsuarioAberturaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inventarios_Depositos_DepositoId",
                        column: x => x.DepositoId,
                        principalTable: "Depositos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Inventarios_Usuarios_UsuarioAberturaId",
                        column: x => x.UsuarioAberturaId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LogsSistema",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: true),
                    Acao = table.Column<string>(type: "text", nullable: false),
                    Modulo = table.Column<string>(type: "text", nullable: false),
                    Detalhes = table.Column<string>(type: "text", nullable: true),
                    DataHora = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogsSistema", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LogsSistema_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Orcamentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    ClienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    RepresentanteId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataValidade = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Desconto = table.Column<decimal>(type: "numeric", nullable: false),
                    ObservacaoInterna = table.Column<string>(type: "text", nullable: true),
                    ObservacaoExterna = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PedidoVendaConvertidoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orcamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orcamentos_Pessoas_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Pessoas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orcamentos_Usuarios_RepresentanteId",
                        column: x => x.RepresentanteId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PedidosVenda",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<int>(type: "integer", nullable: false),
                    ClienteId = table.Column<Guid>(type: "uuid", nullable: false),
                    RepresentanteId = table.Column<Guid>(type: "uuid", nullable: false),
                    FinalidadePedidoId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormaPagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataPrevisaoEntrega = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Desconto = table.Column<decimal>(type: "numeric", nullable: false),
                    ObservacaoInterna = table.Column<string>(type: "text", nullable: true),
                    ObservacaoExterna = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidosVenda", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PedidosVenda_Pessoas_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Pessoas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PedidosVenda_Usuarios_RepresentanteId",
                        column: x => x.RepresentanteId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ParcelasPagar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContaPagarId = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    NumeroParcela = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: true),
                    Juros = table.Column<decimal>(type: "numeric", nullable: true),
                    Multa = table.Column<decimal>(type: "numeric", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FormaPagamento = table.Column<int>(type: "integer", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CarteiraId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParcelasPagar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParcelasPagar_Carteiras_CarteiraId",
                        column: x => x.CarteiraId,
                        principalTable: "Carteiras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParcelasPagar_ContasPagar_ContaPagarId",
                        column: x => x.ContaPagarId,
                        principalTable: "ContasPagar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FichasTecnicas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoFicha = table.Column<string>(type: "text", nullable: true),
                    Versao = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FichasTecnicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FichasTecnicas_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Lotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoLote = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DataAbertura = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataConclusao = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    AlmoxarifadoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lotes_Almoxarifados_AlmoxarifadoId",
                        column: x => x.AlmoxarifadoId,
                        principalTable: "Almoxarifados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Lotes_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProdutoFornecedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    PessoaId = table.Column<Guid>(type: "uuid", nullable: false),
                    FornecedorNome = table.Column<string>(type: "text", nullable: false),
                    Principal = table.Column<bool>(type: "boolean", nullable: false),
                    CodigoFornecedor = table.Column<string>(type: "text", nullable: true),
                    PrecoUltimaCompra = table.Column<decimal>(type: "numeric", nullable: true),
                    UnidadeMedidaCompraId = table.Column<Guid>(type: "uuid", nullable: true),
                    FatorConversao = table.Column<decimal>(type: "numeric", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoFornecedores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoFornecedores_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProdutoFornecedores_UnidadesMedida_UnidadeMedidaCompraId",
                        column: x => x.UnidadeMedidaCompraId,
                        principalTable: "UnidadesMedida",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProdutoVariacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    CodigoHex = table.Column<string>(type: "text", nullable: true),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    EstoqueAtual = table.Column<decimal>(type: "numeric", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoVariacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoVariacoes_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoteirosProducao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Versao = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoteirosProducao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoteirosProducao_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitacoesProducao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoSolicitacao = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DataSolicitacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataAprovacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    EncarregadoId = table.Column<Guid>(type: "uuid", nullable: true),
                    UsuarioAprovacaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TipoOrdemDeProducaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacoesProducao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitacoesProducao_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SolicitacoesProducao_TiposDeOrdemDeProducao_TipoOrdemDeProd~",
                        column: x => x.TipoOrdemDeProducaoId,
                        principalTable: "TiposDeOrdemDeProducao",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SolicitacoesProducao_Usuarios_EncarregadoId",
                        column: x => x.EncarregadoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SolicitacoesProducao_Usuarios_UsuarioAprovacaoId",
                        column: x => x.UsuarioAprovacaoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ItensInventario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InventarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantidadeContada = table.Column<decimal>(type: "numeric", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItensInventario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItensInventario_Inventarios_InventarioId",
                        column: x => x.InventarioId,
                        principalTable: "Inventarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItensInventario_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItensOrcamento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrcamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    DescontoUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItensOrcamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItensOrcamento_Orcamentos_OrcamentoId",
                        column: x => x.OrcamentoId,
                        principalTable: "Orcamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItensOrcamento_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    DataEmissao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    PessoaId = table.Column<Guid>(type: "uuid", nullable: true),
                    PedidoVendaId = table.Column<Guid>(type: "uuid", nullable: true),
                    FormaPagamentoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContasReceber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContasReceber_FormasPagamento_FormaPagamentoId",
                        column: x => x.FormaPagamentoId,
                        principalTable: "FormasPagamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContasReceber_PedidosVenda_PedidoVendaId",
                        column: x => x.PedidoVendaId,
                        principalTable: "PedidosVenda",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ContasReceber_Pessoas_PessoaId",
                        column: x => x.PessoaId,
                        principalTable: "Pessoas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ItensPedido",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PedidoVendaId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    DescontoUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItensPedido", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItensPedido_PedidosVenda_PedidoVendaId",
                        column: x => x.PedidoVendaId,
                        principalTable: "PedidosVenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItensPedido_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BaixasParcelaPagar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParcelaPagarId = table.Column<Guid>(type: "uuid", nullable: false),
                    CarteiraId = table.Column<Guid>(type: "uuid", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    Principal = table.Column<decimal>(type: "numeric", nullable: false),
                    Juros = table.Column<decimal>(type: "numeric", nullable: true),
                    Multa = table.Column<decimal>(type: "numeric", nullable: true),
                    DataPagamento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FormaPagamento = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    Estornada = table.Column<bool>(type: "boolean", nullable: false),
                    DataEstorno = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaixasParcelaPagar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaixasParcelaPagar_Carteiras_CarteiraId",
                        column: x => x.CarteiraId,
                        principalTable: "Carteiras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BaixasParcelaPagar_ParcelasPagar_ParcelaPagarId",
                        column: x => x.ParcelaPagarId,
                        principalTable: "ParcelasPagar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FichaTecnicaSequencias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FichaTecnicaId = table.Column<Guid>(type: "uuid", nullable: false),
                    FaseProducaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    TempoEstimadoDias = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FichaTecnicaSequencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FichaTecnicaSequencias_FasesProducao_FaseProducaoId",
                        column: x => x.FaseProducaoId,
                        principalTable: "FasesProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FichaTecnicaSequencias_FichasTecnicas_FichaTecnicaId",
                        column: x => x.FichaTecnicaId,
                        principalTable: "FichasTecnicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FichaTecnicaItens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoComponenteId = table.Column<Guid>(type: "uuid", nullable: false),
                    FaseProducaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    CorId = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantidade = table.Column<decimal>(type: "numeric", nullable: false),
                    PerdaPercentual = table.Column<decimal>(type: "numeric", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    FichaTecnicaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FichaTecnicaItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FichaTecnicaItens_FasesProducao_FaseProducaoId",
                        column: x => x.FaseProducaoId,
                        principalTable: "FasesProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FichaTecnicaItens_FichasTecnicas_FichaTecnicaId",
                        column: x => x.FichaTecnicaId,
                        principalTable: "FichasTecnicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FichaTecnicaItens_ProdutoVariacoes_CorId",
                        column: x => x.CorId,
                        principalTable: "ProdutoVariacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FichaTecnicaItens_Produtos_ProdutoComponenteId",
                        column: x => x.ProdutoComponenteId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RoteiroProducaoEtapas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoteiroProducaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    FaseProducaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    TempoDias = table.Column<int>(type: "integer", nullable: false),
                    Instrucoes = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoteiroProducaoEtapas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoteiroProducaoEtapas_FasesProducao_FaseProducaoId",
                        column: x => x.FaseProducaoId,
                        principalTable: "FasesProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoteiroProducaoEtapas_RoteirosProducao_RoteiroProducaoId",
                        column: x => x.RoteiroProducaoId,
                        principalTable: "RoteirosProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrdensDeProducao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoOrdem = table.Column<string>(type: "text", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataFim = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    AlmoxarifadoId = table.Column<Guid>(type: "uuid", nullable: false),
                    FaseAtualId = table.Column<Guid>(type: "uuid", nullable: false),
                    LoteId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepositoId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProdutoVariacaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoteiroProducaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    TipoOrdemDeProducaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    SolicitacaoProducaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdensDeProducao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_Almoxarifados_AlmoxarifadoId",
                        column: x => x.AlmoxarifadoId,
                        principalTable: "Almoxarifados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_Depositos_DepositoId",
                        column: x => x.DepositoId,
                        principalTable: "Depositos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_FasesProducao_FaseAtualId",
                        column: x => x.FaseAtualId,
                        principalTable: "FasesProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_ProdutoVariacoes_ProdutoVariacaoId",
                        column: x => x.ProdutoVariacaoId,
                        principalTable: "ProdutoVariacoes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_RoteirosProducao_RoteiroProducaoId",
                        column: x => x.RoteiroProducaoId,
                        principalTable: "RoteirosProducao",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_SolicitacoesProducao_SolicitacaoProducaoId",
                        column: x => x.SolicitacaoProducaoId,
                        principalTable: "SolicitacoesProducao",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrdensDeProducao_TiposDeOrdemDeProducao_TipoOrdemDeProducao~",
                        column: x => x.TipoOrdemDeProducaoId,
                        principalTable: "TiposDeOrdemDeProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SolicitacaoProducaoItens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SolicitacaoProducaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacaoProducaoItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitacaoProducaoItens_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SolicitacaoProducaoItens_SolicitacoesProducao_SolicitacaoPr~",
                        column: x => x.SolicitacaoProducaoId,
                        principalTable: "SolicitacoesProducao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ParcelasReceber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContaReceberId = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    NumeroParcela = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: true),
                    Juros = table.Column<decimal>(type: "numeric", nullable: true),
                    Multa = table.Column<decimal>(type: "numeric", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FormaPagamento = table.Column<int>(type: "integer", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CarteiraId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParcelasReceber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParcelasReceber_Carteiras_CarteiraId",
                        column: x => x.CarteiraId,
                        principalTable: "Carteiras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParcelasReceber_ContasReceber_ContaReceberId",
                        column: x => x.ContaReceberId,
                        principalTable: "ContasReceber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Movimentacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DataMovimentacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Justificativa = table.Column<string>(type: "text", nullable: false),
                    Quantidade = table.Column<decimal>(type: "numeric", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrdemDeProducaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    PedidoVendaId = table.Column<Guid>(type: "uuid", nullable: true),
                    AlmoxarifadoOrigemId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepositoOrigemId = table.Column<Guid>(type: "uuid", nullable: true),
                    AlmoxarifadoDestinoId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepositoDestinoId = table.Column<Guid>(type: "uuid", nullable: true),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movimentacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_Almoxarifados_AlmoxarifadoDestinoId",
                        column: x => x.AlmoxarifadoDestinoId,
                        principalTable: "Almoxarifados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_Almoxarifados_AlmoxarifadoOrigemId",
                        column: x => x.AlmoxarifadoOrigemId,
                        principalTable: "Almoxarifados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_Depositos_DepositoDestinoId",
                        column: x => x.DepositoDestinoId,
                        principalTable: "Depositos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_Depositos_DepositoOrigemId",
                        column: x => x.DepositoOrigemId,
                        principalTable: "Depositos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_OrdensDeProducao_OrdemDeProducaoId",
                        column: x => x.OrdemDeProducaoId,
                        principalTable: "OrdensDeProducao",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Movimentacoes_PedidosVenda_PedidoVendaId",
                        column: x => x.PedidoVendaId,
                        principalTable: "PedidosVenda",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Movimentacoes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BaixasParcelaReceber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParcelaReceberId = table.Column<Guid>(type: "uuid", nullable: false),
                    CarteiraId = table.Column<Guid>(type: "uuid", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    Principal = table.Column<decimal>(type: "numeric", nullable: false),
                    Juros = table.Column<decimal>(type: "numeric", nullable: true),
                    Multa = table.Column<decimal>(type: "numeric", nullable: true),
                    DataPagamento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FormaPagamento = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    Estornada = table.Column<bool>(type: "boolean", nullable: false),
                    DataEstorno = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaixasParcelaReceber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BaixasParcelaReceber_Carteiras_CarteiraId",
                        column: x => x.CarteiraId,
                        principalTable: "Carteiras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BaixasParcelaReceber_ParcelasReceber_ParcelaReceberId",
                        column: x => x.ParcelaReceberId,
                        principalTable: "ParcelasReceber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimentacoesCarteira",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CarteiraId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Origem = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataMovimentacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    ContaPagarId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContaReceberId = table.Column<Guid>(type: "uuid", nullable: true),
                    ParcelaPagarId = table.Column<Guid>(type: "uuid", nullable: true),
                    ParcelaReceberId = table.Column<Guid>(type: "uuid", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DesativadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CriadoPor = table.Column<string>(type: "text", nullable: true),
                    AtualizadoPor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacoesCarteira", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimentacoesCarteira_Carteiras_CarteiraId",
                        column: x => x.CarteiraId,
                        principalTable: "Carteiras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimentacoesCarteira_ContasPagar_ContaPagarId",
                        column: x => x.ContaPagarId,
                        principalTable: "ContasPagar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimentacoesCarteira_ContasReceber_ContaReceberId",
                        column: x => x.ContaReceberId,
                        principalTable: "ContasReceber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimentacoesCarteira_ParcelasPagar_ParcelaPagarId",
                        column: x => x.ParcelaPagarId,
                        principalTable: "ParcelasPagar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimentacoesCarteira_ParcelasReceber_ParcelaReceberId",
                        column: x => x.ParcelaReceberId,
                        principalTable: "ParcelasReceber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Almoxarifados",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "AtualizadoPor", "Codigo", "Contato", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Descricao", "Email", "Localizacao", "Nome", "Responsavel" },
                values: new object[] { new Guid("c0de0000-0000-0000-0000-000000000009"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 0, "(67) 99999-9999", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Almoxarifado principal", "almoxarifado@empresa.com", "Galpão 1", "Almoxarifado Geral", "Sistema" });

            migrationBuilder.InsertData(
                table: "Perfis",
                columns: new[] { "Id", "Acessos", "Ativo", "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Nome" },
                values: new object[,]
                {
                    { new Guid("c0de0000-0000-0000-0000-000000000001"), "", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Administrador" },
                    { new Guid("c0de0000-0000-0000-0000-000000000050"), "Dashboard.Visualizar,Almoxarifados.Visualizar,Almoxarifados.Criar,Almoxarifados.Editar,Almoxarifados.Inativar,Categorias.Visualizar,Categorias.Criar,Categorias.Editar,Categorias.Inativar,CondicoesPagamento.Visualizar,CondicoesPagamento.Criar,CondicoesPagamento.Editar,CondicoesPagamento.Inativar,Depositos.Visualizar,Depositos.Criar,Depositos.Editar,Depositos.Excluir,FasesProducao.Visualizar,FasesProducao.Criar,FasesProducao.Editar,FasesProducao.Excluir,Finalidades.Visualizar,Finalidades.Criar,Finalidades.Editar,Finalidades.Inativar,FormasPagamento.Visualizar,FormasPagamento.Criar,FormasPagamento.Editar,FormasPagamento.Inativar,TiposOrdem.Visualizar,TiposOrdem.Criar,TiposOrdem.Editar,TiposOrdem.Excluir,UnidadesMedida.Visualizar,UnidadesMedida.Criar,UnidadesMedida.Editar,UnidadesMedida.Excluir,Fornecedores.Visualizar,Fornecedores.Criar,Fornecedores.Editar,Fornecedores.Inativar,Produtos.Visualizar,Produtos.Criar,Produtos.Editar,Produtos.Inativar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir,FichasTecnicas.Visualizar,FichasTecnicas.Criar,FichasTecnicas.Editar,FichasTecnicas.Inativar,Roteiros.Visualizar,Roteiros.Criar,Roteiros.Editar,Roteiros.Excluir,Estoque.Visualizar,Movimentacoes.Visualizar,Movimentacoes.Criar,Movimentacoes.Editar,Movimentacoes.Excluir,Inventarios.Visualizar,Inventarios.Criar,Inventarios.Editar,Inventarios.Finalizar,Inventarios.Cancelar,Financeiro.Visualizar,Lotes.Visualizar,Lotes.Criar,Lotes.Editar,Lotes.Cancelar,OrdensProducao.Visualizar,OrdensProducao.Criar,OrdensProducao.Editar,OrdensProducao.Cancelar,OrdensProducao.Finalizar,OrdensProducao.AvancarFase,OrdensProducao.Estornar,Solicitacoes.Visualizar,Solicitacoes.Criar,Solicitacoes.Aprovar,Solicitacoes.Cancelar,Relatorios.Visualizar", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gerente" },
                    { new Guid("c0de0000-0000-0000-0000-000000000051"), "Dashboard.Visualizar,Produtos.Visualizar,Fornecedores.Visualizar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Vendedor" }
                });

            migrationBuilder.InsertData(
                table: "TiposDeOrdemDeProducao",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "AtualizadoPor", "Codigo", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Descricao", "Nome" },
                values: new object[] { new Guid("c0de0000-0000-0000-0000-000000000008"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ordem de Produção Padrão", "Normal" });

            migrationBuilder.InsertData(
                table: "UnidadesMedida",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "EhUnidadeBase", "FatorConversao", "Grandeza", "Nome", "Sigla" },
                values: new object[,]
                {
                    { new Guid("c0de0000-0000-0000-0000-000000000002"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1m, 0, "Unidade", "UN" },
                    { new Guid("c0de0000-0000-0000-0000-000000000003"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1m, 1, "Kilograma", "KG" },
                    { new Guid("c0de0000-0000-0000-0000-000000000012"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1m, 2, "Metro", "M" },
                    { new Guid("c0de0000-0000-0000-0000-000000000020"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1m, 0, "Peça", "PC" },
                    { new Guid("c0de0000-0000-0000-0000-000000000021"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1m, 0, "Caixa", "CX" },
                    { new Guid("c0de0000-0000-0000-0000-000000000022"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1m, 0, "Kit", "KIT" },
                    { new Guid("c0de0000-0000-0000-0000-000000000023"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 12m, 0, "Dúzia", "DZ" },
                    { new Guid("c0de0000-0000-0000-0000-000000000024"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1000m, 0, "Milheiro", "MIL" },
                    { new Guid("c0de0000-0000-0000-0000-000000000031"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.000001m, 1, "Miligrama", "MG" },
                    { new Guid("c0de0000-0000-0000-0000-000000000032"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1000m, 1, "Tonelada", "TON" },
                    { new Guid("c0de0000-0000-0000-0000-000000000040"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.01m, 2, "Centímetro", "CM" },
                    { new Guid("c0de0000-0000-0000-0000-000000000041"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.001m, 2, "Milímetro", "MM" },
                    { new Guid("c0de0000-0000-0000-0000-000000000042"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1000m, 2, "Quilômetro", "KM" },
                    { new Guid("c0de0000-0000-0000-0000-000000000050"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1m, 3, "Litro", "L" },
                    { new Guid("c0de0000-0000-0000-0000-000000000051"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.001m, 3, "Mililitro", "ML" },
                    { new Guid("c0de0000-0000-0000-0000-000000000052"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 1000m, 3, "Metro Cúbico", "M3" },
                    { new Guid("c0de0000-0000-0000-0000-000000000060"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1m, 5, "Metro Quadrado", "M2" },
                    { new Guid("c0de0000-0000-0000-0000-000000000061"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.0001m, 5, "Centímetro Quadrado", "CM2" },
                    { new Guid("c0de0000-0000-0000-0000-000000000070"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1m, 4, "Hora", "H" },
                    { new Guid("c0de0000-0000-0000-0000-000000000071"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.0166667m, 4, "Minuto", "MIN" },
                    { new Guid("c0de0000-0000-0000-0000-000000000099"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, 0.001m, 1, "Grama", "G" }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Email", "Nome", "PerfilId", "SenhaHash" },
                values: new object[] { new Guid("c0de0000-0000-0000-0000-000000000000"), true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "admin@valisys.com", "Administrador Master", new Guid("c0de0000-0000-0000-0000-000000000001"), "$2a$12$ANrNWbumb63JFxo..Ar6A.3iQJhEqJUqR5kqjklRZoZHs3uM7C4k2" });

            migrationBuilder.CreateIndex(
                name: "IX_BaixasParcelaPagar_CarteiraId",
                table: "BaixasParcelaPagar",
                column: "CarteiraId");

            migrationBuilder.CreateIndex(
                name: "IX_BaixasParcelaPagar_ParcelaPagarId",
                table: "BaixasParcelaPagar",
                column: "ParcelaPagarId");

            migrationBuilder.CreateIndex(
                name: "IX_BaixasParcelaReceber_CarteiraId",
                table: "BaixasParcelaReceber",
                column: "CarteiraId");

            migrationBuilder.CreateIndex(
                name: "IX_BaixasParcelaReceber_ParcelaReceberId",
                table: "BaixasParcelaReceber",
                column: "ParcelaReceberId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoriasProduto_CodigoInterno",
                table: "CategoriasProduto",
                column: "CodigoInterno",
                unique: true,
                filter: "\"CodigoInterno\" IS NOT NULL");

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
                name: "IX_ContasPagar_Codigo",
                table: "ContasPagar",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_FormaPagamentoId",
                table: "ContasPagar",
                column: "FormaPagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_FornecedorId",
                table: "ContasPagar",
                column: "FornecedorId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_RegraRecorrenciaId",
                table: "ContasPagar",
                column: "RegraRecorrenciaId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_Status",
                table: "ContasPagar",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_Codigo",
                table: "ContasReceber",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_FormaPagamentoId",
                table: "ContasReceber",
                column: "FormaPagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_PedidoVendaId",
                table: "ContasReceber",
                column: "PedidoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_PessoaId",
                table: "ContasReceber",
                column: "PessoaId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasReceber_Status",
                table: "ContasReceber",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Depositos_AlmoxarifadoId",
                table: "Depositos",
                column: "AlmoxarifadoId");

            migrationBuilder.CreateIndex(
                name: "IX_FichasTecnicas_ProdutoId",
                table: "FichasTecnicas",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_FichaTecnicaItens_CorId",
                table: "FichaTecnicaItens",
                column: "CorId");

            migrationBuilder.CreateIndex(
                name: "IX_FichaTecnicaItens_FaseProducaoId",
                table: "FichaTecnicaItens",
                column: "FaseProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_FichaTecnicaItens_FichaTecnicaId",
                table: "FichaTecnicaItens",
                column: "FichaTecnicaId");

            migrationBuilder.CreateIndex(
                name: "IX_FichaTecnicaItens_ProdutoComponenteId",
                table: "FichaTecnicaItens",
                column: "ProdutoComponenteId");

            migrationBuilder.CreateIndex(
                name: "IX_FichaTecnicaSequencias_FaseProducaoId",
                table: "FichaTecnicaSequencias",
                column: "FaseProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_FichaTecnicaSequencias_FichaTecnicaId",
                table: "FichaTecnicaSequencias",
                column: "FichaTecnicaId");

            migrationBuilder.CreateIndex(
                name: "IX_Finalidades_Codigo",
                table: "Finalidades",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Finalidades_Nome",
                table: "Finalidades",
                column: "Nome",
                unique: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_Inventarios_DepositoId",
                table: "Inventarios",
                column: "DepositoId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventarios_Numero",
                table: "Inventarios",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventarios_UsuarioAberturaId",
                table: "Inventarios",
                column: "UsuarioAberturaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensInventario_InventarioId",
                table: "ItensInventario",
                column: "InventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensInventario_ProdutoId",
                table: "ItensInventario",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensOrcamento_OrcamentoId",
                table: "ItensOrcamento",
                column: "OrcamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensOrcamento_ProdutoId",
                table: "ItensOrcamento",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensPedido_PedidoVendaId",
                table: "ItensPedido",
                column: "PedidoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItensPedido_ProdutoId",
                table: "ItensPedido",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_LogsSistema_DataHora",
                table: "LogsSistema",
                column: "DataHora");

            migrationBuilder.CreateIndex(
                name: "IX_LogsSistema_UsuarioId",
                table: "LogsSistema",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Lotes_AlmoxarifadoId",
                table: "Lotes",
                column: "AlmoxarifadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Lotes_ProdutoId",
                table: "Lotes",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_AlmoxarifadoDestinoId",
                table: "Movimentacoes",
                column: "AlmoxarifadoDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_AlmoxarifadoOrigemId",
                table: "Movimentacoes",
                column: "AlmoxarifadoOrigemId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_DepositoDestinoId",
                table: "Movimentacoes",
                column: "DepositoDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_DepositoOrigemId",
                table: "Movimentacoes",
                column: "DepositoOrigemId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_OrdemDeProducaoId",
                table: "Movimentacoes",
                column: "OrdemDeProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_PedidoVendaId",
                table: "Movimentacoes",
                column: "PedidoVendaId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_ProdutoId",
                table: "Movimentacoes",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_UsuarioId",
                table: "Movimentacoes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesCarteira_CarteiraId",
                table: "MovimentacoesCarteira",
                column: "CarteiraId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesCarteira_ContaPagarId",
                table: "MovimentacoesCarteira",
                column: "ContaPagarId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesCarteira_ContaReceberId",
                table: "MovimentacoesCarteira",
                column: "ContaReceberId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesCarteira_ParcelaPagarId",
                table: "MovimentacoesCarteira",
                column: "ParcelaPagarId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesCarteira_ParcelaReceberId",
                table: "MovimentacoesCarteira",
                column: "ParcelaReceberId");

            migrationBuilder.CreateIndex(
                name: "IX_Orcamentos_ClienteId",
                table: "Orcamentos",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Orcamentos_Codigo",
                table: "Orcamentos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orcamentos_DataEmissao",
                table: "Orcamentos",
                column: "DataEmissao");

            migrationBuilder.CreateIndex(
                name: "IX_Orcamentos_RepresentanteId",
                table: "Orcamentos",
                column: "RepresentanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Orcamentos_Status",
                table: "Orcamentos",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_AlmoxarifadoId",
                table: "OrdensDeProducao",
                column: "AlmoxarifadoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_DepositoId",
                table: "OrdensDeProducao",
                column: "DepositoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_FaseAtualId",
                table: "OrdensDeProducao",
                column: "FaseAtualId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_LoteId",
                table: "OrdensDeProducao",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_ProdutoId",
                table: "OrdensDeProducao",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_ProdutoVariacaoId",
                table: "OrdensDeProducao",
                column: "ProdutoVariacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_RoteiroProducaoId",
                table: "OrdensDeProducao",
                column: "RoteiroProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_SolicitacaoProducaoId",
                table: "OrdensDeProducao",
                column: "SolicitacaoProducaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_TipoOrdemDeProducaoId",
                table: "OrdensDeProducao",
                column: "TipoOrdemDeProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasCondicao_CondicaoPagamentoId",
                table: "ParcelasCondicao",
                column: "CondicaoPagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasPagar_CarteiraId",
                table: "ParcelasPagar",
                column: "CarteiraId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasPagar_ContaPagarId_NumeroParcela",
                table: "ParcelasPagar",
                columns: new[] { "ContaPagarId", "NumeroParcela" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasReceber_CarteiraId",
                table: "ParcelasReceber",
                column: "CarteiraId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasReceber_ContaReceberId_NumeroParcela",
                table: "ParcelasReceber",
                columns: new[] { "ContaReceberId", "NumeroParcela" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PedidosVenda_ClienteId",
                table: "PedidosVenda",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidosVenda_Codigo",
                table: "PedidosVenda",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PedidosVenda_RepresentanteId",
                table: "PedidosVenda",
                column: "RepresentanteId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidosVenda_Status",
                table: "PedidosVenda",
                column: "Status");

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

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFornecedores_ProdutoId",
                table: "ProdutoFornecedores",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFornecedores_UnidadeMedidaCompraId",
                table: "ProdutoFornecedores",
                column: "UnidadeMedidaCompraId");

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_CategoriaProdutoId",
                table: "Produtos",
                column: "CategoriaProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_CodigoInternoProduto",
                table: "Produtos",
                column: "CodigoInternoProduto",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_UnidadeMedidaId",
                table: "Produtos",
                column: "UnidadeMedidaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoVariacoes_ProdutoId",
                table: "ProdutoVariacoes",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UsuarioId_IsRevoked",
                table: "RefreshTokens",
                columns: new[] { "UsuarioId", "IsRevoked" });

            migrationBuilder.CreateIndex(
                name: "IX_RoteiroProducaoEtapas_FaseProducaoId",
                table: "RoteiroProducaoEtapas",
                column: "FaseProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_RoteiroProducaoEtapas_RoteiroProducaoId",
                table: "RoteiroProducaoEtapas",
                column: "RoteiroProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_RoteirosProducao_ProdutoId",
                table: "RoteirosProducao",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacaoProducaoItens_ProdutoId",
                table: "SolicitacaoProducaoItens",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacaoProducaoItens_SolicitacaoProducaoId",
                table: "SolicitacaoProducaoItens",
                column: "SolicitacaoProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesProducao_EncarregadoId",
                table: "SolicitacoesProducao",
                column: "EncarregadoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesProducao_ProdutoId",
                table: "SolicitacoesProducao",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesProducao_TipoOrdemDeProducaoId",
                table: "SolicitacoesProducao",
                column: "TipoOrdemDeProducaoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesProducao_UsuarioAprovacaoId",
                table: "SolicitacoesProducao",
                column: "UsuarioAprovacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_PerfilId",
                table: "Usuarios",
                column: "PerfilId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaixasParcelaPagar");

            migrationBuilder.DropTable(
                name: "BaixasParcelaReceber");

            migrationBuilder.DropTable(
                name: "FichaTecnicaItens");

            migrationBuilder.DropTable(
                name: "FichaTecnicaSequencias");

            migrationBuilder.DropTable(
                name: "Finalidades");

            migrationBuilder.DropTable(
                name: "FormaPagamentoVendedores");

            migrationBuilder.DropTable(
                name: "Fornecedores");

            migrationBuilder.DropTable(
                name: "ItensInventario");

            migrationBuilder.DropTable(
                name: "ItensOrcamento");

            migrationBuilder.DropTable(
                name: "ItensPedido");

            migrationBuilder.DropTable(
                name: "LogsSistema");

            migrationBuilder.DropTable(
                name: "Movimentacoes");

            migrationBuilder.DropTable(
                name: "MovimentacoesCarteira");

            migrationBuilder.DropTable(
                name: "ParcelasCondicao");

            migrationBuilder.DropTable(
                name: "PessoasFisicas");

            migrationBuilder.DropTable(
                name: "PessoasJuridicas");

            migrationBuilder.DropTable(
                name: "ProdutoFornecedores");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RoteiroProducaoEtapas");

            migrationBuilder.DropTable(
                name: "SolicitacaoProducaoItens");

            migrationBuilder.DropTable(
                name: "FichasTecnicas");

            migrationBuilder.DropTable(
                name: "Inventarios");

            migrationBuilder.DropTable(
                name: "Orcamentos");

            migrationBuilder.DropTable(
                name: "OrdensDeProducao");

            migrationBuilder.DropTable(
                name: "ParcelasPagar");

            migrationBuilder.DropTable(
                name: "ParcelasReceber");

            migrationBuilder.DropTable(
                name: "CondicoesPagamento");

            migrationBuilder.DropTable(
                name: "Depositos");

            migrationBuilder.DropTable(
                name: "FasesProducao");

            migrationBuilder.DropTable(
                name: "Lotes");

            migrationBuilder.DropTable(
                name: "ProdutoVariacoes");

            migrationBuilder.DropTable(
                name: "RoteirosProducao");

            migrationBuilder.DropTable(
                name: "SolicitacoesProducao");

            migrationBuilder.DropTable(
                name: "ContasPagar");

            migrationBuilder.DropTable(
                name: "Carteiras");

            migrationBuilder.DropTable(
                name: "ContasReceber");

            migrationBuilder.DropTable(
                name: "Almoxarifados");

            migrationBuilder.DropTable(
                name: "Produtos");

            migrationBuilder.DropTable(
                name: "TiposDeOrdemDeProducao");

            migrationBuilder.DropTable(
                name: "RegrasRecorrencia");

            migrationBuilder.DropTable(
                name: "FormasPagamento");

            migrationBuilder.DropTable(
                name: "PedidosVenda");

            migrationBuilder.DropTable(
                name: "CategoriasProduto");

            migrationBuilder.DropTable(
                name: "UnidadesMedida");

            migrationBuilder.DropTable(
                name: "Pessoas");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Perfis");

            migrationBuilder.DropSequence(
                name: "conta_pagar_codigo_seq");

            migrationBuilder.DropSequence(
                name: "conta_receber_codigo_seq");
        }
    }
}
