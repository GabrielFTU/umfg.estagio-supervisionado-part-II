using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddDiaVencimentoToCondicaoPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DiaVencimento",
                table: "CondicoesPagamento",
                type: "integer",
                nullable: true);

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

            migrationBuilder.UpdateData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000050"),
                column: "Acessos",
                value: "Dashboard.Visualizar,Almoxarifados.Visualizar,Almoxarifados.Criar,Almoxarifados.Editar,Almoxarifados.Inativar,Categorias.Visualizar,Categorias.Criar,Categorias.Editar,Categorias.Inativar,CondicoesPagamento.Visualizar,CondicoesPagamento.Criar,CondicoesPagamento.Editar,CondicoesPagamento.Inativar,Depositos.Visualizar,Depositos.Criar,Depositos.Editar,Depositos.Excluir,FasesProducao.Visualizar,FasesProducao.Criar,FasesProducao.Editar,FasesProducao.Excluir,Finalidades.Visualizar,Finalidades.Criar,Finalidades.Editar,Finalidades.Inativar,FormasPagamento.Visualizar,FormasPagamento.Criar,FormasPagamento.Editar,FormasPagamento.Inativar,TiposOrdem.Visualizar,TiposOrdem.Criar,TiposOrdem.Editar,TiposOrdem.Excluir,UnidadesMedida.Visualizar,UnidadesMedida.Criar,UnidadesMedida.Editar,UnidadesMedida.Excluir,Fornecedores.Visualizar,Fornecedores.Criar,Fornecedores.Editar,Fornecedores.Inativar,Produtos.Visualizar,Produtos.Criar,Produtos.Editar,Produtos.Inativar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir,FichasTecnicas.Visualizar,FichasTecnicas.Criar,FichasTecnicas.Editar,FichasTecnicas.Inativar,Roteiros.Visualizar,Roteiros.Criar,Roteiros.Editar,Roteiros.Excluir,Estoque.Visualizar,Movimentacoes.Visualizar,Movimentacoes.Criar,Movimentacoes.Editar,Movimentacoes.Excluir,Inventarios.Visualizar,Inventarios.Criar,Inventarios.Editar,Inventarios.Finalizar,Inventarios.Cancelar,Financeiro.Visualizar,Lotes.Visualizar,Lotes.Criar,Lotes.Editar,Lotes.Cancelar,OrdensProducao.Visualizar,OrdensProducao.Criar,OrdensProducao.Editar,OrdensProducao.Cancelar,OrdensProducao.Finalizar,OrdensProducao.AvancarFase,OrdensProducao.Estornar,Solicitacoes.Visualizar,Solicitacoes.Criar,Solicitacoes.Aprovar,Solicitacoes.Cancelar,Relatorios.Visualizar");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItensInventario");

            migrationBuilder.DropTable(
                name: "Inventarios");

            migrationBuilder.DropColumn(
                name: "DiaVencimento",
                table: "CondicoesPagamento");

            migrationBuilder.UpdateData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000050"),
                column: "Acessos",
                value: "Dashboard.Visualizar,Almoxarifados.Visualizar,Almoxarifados.Criar,Almoxarifados.Editar,Almoxarifados.Inativar,Categorias.Visualizar,Categorias.Criar,Categorias.Editar,Categorias.Inativar,CondicoesPagamento.Visualizar,CondicoesPagamento.Criar,CondicoesPagamento.Editar,CondicoesPagamento.Inativar,Depositos.Visualizar,Depositos.Criar,Depositos.Editar,Depositos.Excluir,FasesProducao.Visualizar,FasesProducao.Criar,FasesProducao.Editar,FasesProducao.Excluir,Finalidades.Visualizar,Finalidades.Criar,Finalidades.Editar,Finalidades.Inativar,FormasPagamento.Visualizar,FormasPagamento.Criar,FormasPagamento.Editar,FormasPagamento.Inativar,TiposOrdem.Visualizar,TiposOrdem.Criar,TiposOrdem.Editar,TiposOrdem.Excluir,UnidadesMedida.Visualizar,UnidadesMedida.Criar,UnidadesMedida.Editar,UnidadesMedida.Excluir,Fornecedores.Visualizar,Fornecedores.Criar,Fornecedores.Editar,Fornecedores.Inativar,Produtos.Visualizar,Produtos.Criar,Produtos.Editar,Produtos.Inativar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir,FichasTecnicas.Visualizar,FichasTecnicas.Criar,FichasTecnicas.Editar,FichasTecnicas.Inativar,Roteiros.Visualizar,Roteiros.Criar,Roteiros.Editar,Roteiros.Excluir,Estoque.Visualizar,Movimentacoes.Visualizar,Movimentacoes.Criar,Movimentacoes.Editar,Movimentacoes.Excluir,Financeiro.Visualizar,Lotes.Visualizar,Lotes.Criar,Lotes.Editar,Lotes.Cancelar,OrdensProducao.Visualizar,OrdensProducao.Criar,OrdensProducao.Editar,OrdensProducao.Cancelar,OrdensProducao.Finalizar,OrdensProducao.AvancarFase,OrdensProducao.Estornar,Solicitacoes.Visualizar,Solicitacoes.Criar,Solicitacoes.Aprovar,Solicitacoes.Cancelar,Relatorios.Visualizar");
        }
    }
}
