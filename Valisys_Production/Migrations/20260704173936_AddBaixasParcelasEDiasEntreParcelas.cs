using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddBaixasParcelasEDiasEntreParcelas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContasPagar_Fornecedores_FornecedorId",
                table: "ContasPagar");

            migrationBuilder.DropIndex(
                name: "IX_ParcelasReceber_ContaReceberId",
                table: "ParcelasReceber");

            migrationBuilder.DropIndex(
                name: "IX_ParcelasPagar_ContaPagarId",
                table: "ParcelasPagar");

            migrationBuilder.RenameColumn(
                name: "DiastEntreParcelas",
                table: "CondicoesPagamento",
                newName: "DiasEntreParcelas");

            migrationBuilder.CreateSequence(
                name: "conta_pagar_codigo_seq");

            migrationBuilder.CreateSequence(
                name: "conta_receber_codigo_seq");

            migrationBuilder.AddColumn<Guid>(
                name: "CarteiraId",
                table: "ParcelasReceber",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "ParcelasReceber",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CarteiraId",
                table: "ParcelasPagar",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "ParcelasPagar",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "DepositoId",
                table: "OrdensDeProducao",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FormaPagamentoId",
                table: "ContasReceber",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FormaPagamentoId",
                table: "ContasPagar",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumeroOcorrenciaRecorrencia",
                table: "ContasPagar",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RegraRecorrenciaId",
                table: "ContasPagar",
                type: "uuid",
                nullable: true);

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
                table: "Perfis",
                columns: new[] { "Id", "Acessos", "Ativo", "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Nome" },
                values: new object[,]
                {
                    { new Guid("c0de0000-0000-0000-0000-000000000050"), "Dashboard.Visualizar,Almoxarifados.Visualizar,Almoxarifados.Criar,Almoxarifados.Editar,Almoxarifados.Inativar,Categorias.Visualizar,Categorias.Criar,Categorias.Editar,Categorias.Inativar,CondicoesPagamento.Visualizar,CondicoesPagamento.Criar,CondicoesPagamento.Editar,CondicoesPagamento.Inativar,Depositos.Visualizar,Depositos.Criar,Depositos.Editar,Depositos.Excluir,FasesProducao.Visualizar,FasesProducao.Criar,FasesProducao.Editar,FasesProducao.Excluir,Finalidades.Visualizar,Finalidades.Criar,Finalidades.Editar,Finalidades.Inativar,FormasPagamento.Visualizar,FormasPagamento.Criar,FormasPagamento.Editar,FormasPagamento.Inativar,TiposOrdem.Visualizar,TiposOrdem.Criar,TiposOrdem.Editar,TiposOrdem.Excluir,UnidadesMedida.Visualizar,UnidadesMedida.Criar,UnidadesMedida.Editar,UnidadesMedida.Excluir,Fornecedores.Visualizar,Fornecedores.Criar,Fornecedores.Editar,Fornecedores.Inativar,Produtos.Visualizar,Produtos.Criar,Produtos.Editar,Produtos.Inativar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir,FichasTecnicas.Visualizar,FichasTecnicas.Criar,FichasTecnicas.Editar,FichasTecnicas.Inativar,Roteiros.Visualizar,Roteiros.Criar,Roteiros.Editar,Roteiros.Excluir,Estoque.Visualizar,Movimentacoes.Visualizar,Movimentacoes.Criar,Movimentacoes.Editar,Movimentacoes.Excluir,Financeiro.Visualizar,Lotes.Visualizar,Lotes.Criar,Lotes.Editar,Lotes.Cancelar,OrdensProducao.Visualizar,OrdensProducao.Criar,OrdensProducao.Editar,OrdensProducao.Cancelar,OrdensProducao.Finalizar,OrdensProducao.AvancarFase,OrdensProducao.Estornar,Solicitacoes.Visualizar,Solicitacoes.Criar,Solicitacoes.Aprovar,Solicitacoes.Cancelar,Relatorios.Visualizar", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gerente" },
                    { new Guid("c0de0000-0000-0000-0000-000000000051"), "Dashboard.Visualizar,Produtos.Visualizar,Fornecedores.Visualizar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Vendedor" }
                });

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
                name: "IX_ParcelasPagar_CarteiraId",
                table: "ParcelasPagar",
                column: "CarteiraId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasPagar_ContaPagarId_NumeroParcela",
                table: "ParcelasPagar",
                columns: new[] { "ContaPagarId", "NumeroParcela" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrdensDeProducao_DepositoId",
                table: "OrdensDeProducao",
                column: "DepositoId");

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
                name: "IX_ContasPagar_Codigo",
                table: "ContasPagar",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_FormaPagamentoId",
                table: "ContasPagar",
                column: "FormaPagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ContasPagar_RegraRecorrenciaId",
                table: "ContasPagar",
                column: "RegraRecorrenciaId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_ContasPagar_FormasPagamento_FormaPagamentoId",
                table: "ContasPagar",
                column: "FormaPagamentoId",
                principalTable: "FormasPagamento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ContasPagar_Pessoas_FornecedorId",
                table: "ContasPagar",
                column: "FornecedorId",
                principalTable: "Pessoas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ContasPagar_RegrasRecorrencia_RegraRecorrenciaId",
                table: "ContasPagar",
                column: "RegraRecorrenciaId",
                principalTable: "RegrasRecorrencia",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ContasReceber_FormasPagamento_FormaPagamentoId",
                table: "ContasReceber",
                column: "FormaPagamentoId",
                principalTable: "FormasPagamento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdensDeProducao_Depositos_DepositoId",
                table: "OrdensDeProducao",
                column: "DepositoId",
                principalTable: "Depositos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ParcelasPagar_Carteiras_CarteiraId",
                table: "ParcelasPagar",
                column: "CarteiraId",
                principalTable: "Carteiras",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ParcelasReceber_Carteiras_CarteiraId",
                table: "ParcelasReceber",
                column: "CarteiraId",
                principalTable: "Carteiras",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContasPagar_FormasPagamento_FormaPagamentoId",
                table: "ContasPagar");

            migrationBuilder.DropForeignKey(
                name: "FK_ContasPagar_Pessoas_FornecedorId",
                table: "ContasPagar");

            migrationBuilder.DropForeignKey(
                name: "FK_ContasPagar_RegrasRecorrencia_RegraRecorrenciaId",
                table: "ContasPagar");

            migrationBuilder.DropForeignKey(
                name: "FK_ContasReceber_FormasPagamento_FormaPagamentoId",
                table: "ContasReceber");

            migrationBuilder.DropForeignKey(
                name: "FK_OrdensDeProducao_Depositos_DepositoId",
                table: "OrdensDeProducao");

            migrationBuilder.DropForeignKey(
                name: "FK_ParcelasPagar_Carteiras_CarteiraId",
                table: "ParcelasPagar");

            migrationBuilder.DropForeignKey(
                name: "FK_ParcelasReceber_Carteiras_CarteiraId",
                table: "ParcelasReceber");

            migrationBuilder.DropTable(
                name: "BaixasParcelaPagar");

            migrationBuilder.DropTable(
                name: "BaixasParcelaReceber");

            migrationBuilder.DropTable(
                name: "MovimentacoesCarteira");

            migrationBuilder.DropTable(
                name: "RegrasRecorrencia");

            migrationBuilder.DropTable(
                name: "Carteiras");

            migrationBuilder.DropIndex(
                name: "IX_ParcelasReceber_CarteiraId",
                table: "ParcelasReceber");

            migrationBuilder.DropIndex(
                name: "IX_ParcelasReceber_ContaReceberId_NumeroParcela",
                table: "ParcelasReceber");

            migrationBuilder.DropIndex(
                name: "IX_ParcelasPagar_CarteiraId",
                table: "ParcelasPagar");

            migrationBuilder.DropIndex(
                name: "IX_ParcelasPagar_ContaPagarId_NumeroParcela",
                table: "ParcelasPagar");

            migrationBuilder.DropIndex(
                name: "IX_OrdensDeProducao_DepositoId",
                table: "OrdensDeProducao");

            migrationBuilder.DropIndex(
                name: "IX_ContasReceber_Codigo",
                table: "ContasReceber");

            migrationBuilder.DropIndex(
                name: "IX_ContasReceber_FormaPagamentoId",
                table: "ContasReceber");

            migrationBuilder.DropIndex(
                name: "IX_ContasPagar_Codigo",
                table: "ContasPagar");

            migrationBuilder.DropIndex(
                name: "IX_ContasPagar_FormaPagamentoId",
                table: "ContasPagar");

            migrationBuilder.DropIndex(
                name: "IX_ContasPagar_RegraRecorrenciaId",
                table: "ContasPagar");

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000050"));

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000051"));

            migrationBuilder.DropColumn(
                name: "CarteiraId",
                table: "ParcelasReceber");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "ParcelasReceber");

            migrationBuilder.DropColumn(
                name: "CarteiraId",
                table: "ParcelasPagar");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "ParcelasPagar");

            migrationBuilder.DropColumn(
                name: "DepositoId",
                table: "OrdensDeProducao");

            migrationBuilder.DropColumn(
                name: "FormaPagamentoId",
                table: "ContasReceber");

            migrationBuilder.DropColumn(
                name: "FormaPagamentoId",
                table: "ContasPagar");

            migrationBuilder.DropColumn(
                name: "NumeroOcorrenciaRecorrencia",
                table: "ContasPagar");

            migrationBuilder.DropColumn(
                name: "RegraRecorrenciaId",
                table: "ContasPagar");

            migrationBuilder.DropSequence(
                name: "conta_pagar_codigo_seq");

            migrationBuilder.DropSequence(
                name: "conta_receber_codigo_seq");

            migrationBuilder.RenameColumn(
                name: "DiasEntreParcelas",
                table: "CondicoesPagamento",
                newName: "DiastEntreParcelas");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasReceber_ContaReceberId",
                table: "ParcelasReceber",
                column: "ContaReceberId");

            migrationBuilder.CreateIndex(
                name: "IX_ParcelasPagar_ContaPagarId",
                table: "ParcelasPagar",
                column: "ContaPagarId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContasPagar_Fornecedores_FornecedorId",
                table: "ContasPagar",
                column: "FornecedorId",
                principalTable: "Fornecedores",
                principalColumn: "Id");
        }
    }
}
