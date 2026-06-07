using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class AddPedidoVenda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContasReceber_PedidoVenda_PedidoVendaId",
                table: "ContasReceber");

            migrationBuilder.DropForeignKey(
                name: "FK_Deposito_Almoxarifados_AlmoxarifadoId",
                table: "Deposito");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemPedido_PedidoVenda_PedidoVendaId",
                table: "ItemPedido");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PedidoVenda",
                table: "PedidoVenda");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ItemPedido",
                table: "ItemPedido");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Deposito",
                table: "Deposito");

            migrationBuilder.RenameTable(
                name: "PedidoVenda",
                newName: "PedidosVenda");

            migrationBuilder.RenameTable(
                name: "ItemPedido",
                newName: "ItensPedido");

            migrationBuilder.RenameTable(
                name: "Deposito",
                newName: "Depositos");

            migrationBuilder.RenameIndex(
                name: "IX_ItemPedido_PedidoVendaId",
                table: "ItensPedido",
                newName: "IX_ItensPedido_PedidoVendaId");

            migrationBuilder.RenameIndex(
                name: "IX_Deposito_AlmoxarifadoId",
                table: "Depositos",
                newName: "IX_Depositos_AlmoxarifadoId");

            migrationBuilder.AddColumn<decimal>(
                name: "CustoPadrao",
                table: "Produtos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CustoUltimaCompra",
                table: "Produtos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataUltimaCompra",
                table: "Produtos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagemUrl",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ncm",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrigemMercadoria",
                table: "Produtos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Sku",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoItem",
                table: "Produtos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PedidosVenda",
                table: "PedidosVenda",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItensPedido",
                table: "ItensPedido",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Depositos",
                table: "Depositos",
                column: "Id");

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
                    ProdutoId1 = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_ProdutoFornecedores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoFornecedores_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProdutoFornecedores_Produtos_ProdutoId1",
                        column: x => x.ProdutoId1,
                        principalTable: "Produtos",
                        principalColumn: "Id");
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
                    ProdutoId1 = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_ProdutoVariacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoVariacoes_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProdutoVariacoes_Produtos_ProdutoId1",
                        column: x => x.ProdutoId1,
                        principalTable: "Produtos",
                        principalColumn: "Id");
                });

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
                name: "IX_ItensPedido_ProdutoId",
                table: "ItensPedido",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFornecedores_ProdutoId",
                table: "ProdutoFornecedores",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFornecedores_ProdutoId1",
                table: "ProdutoFornecedores",
                column: "ProdutoId1");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFornecedores_UnidadeMedidaCompraId",
                table: "ProdutoFornecedores",
                column: "UnidadeMedidaCompraId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoVariacoes_ProdutoId",
                table: "ProdutoVariacoes",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoVariacoes_ProdutoId1",
                table: "ProdutoVariacoes",
                column: "ProdutoId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ContasReceber_PedidosVenda_PedidoVendaId",
                table: "ContasReceber",
                column: "PedidoVendaId",
                principalTable: "PedidosVenda",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Depositos_Almoxarifados_AlmoxarifadoId",
                table: "Depositos",
                column: "AlmoxarifadoId",
                principalTable: "Almoxarifados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensPedido_PedidosVenda_PedidoVendaId",
                table: "ItensPedido",
                column: "PedidoVendaId",
                principalTable: "PedidosVenda",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensPedido_Produtos_ProdutoId",
                table: "ItensPedido",
                column: "ProdutoId",
                principalTable: "Produtos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PedidosVenda_Pessoas_ClienteId",
                table: "PedidosVenda",
                column: "ClienteId",
                principalTable: "Pessoas",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContasReceber_PedidosVenda_PedidoVendaId",
                table: "ContasReceber");

            migrationBuilder.DropForeignKey(
                name: "FK_Depositos_Almoxarifados_AlmoxarifadoId",
                table: "Depositos");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensPedido_PedidosVenda_PedidoVendaId",
                table: "ItensPedido");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensPedido_Produtos_ProdutoId",
                table: "ItensPedido");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidosVenda_Pessoas_ClienteId",
                table: "PedidosVenda");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidosVenda_Usuarios_RepresentanteId",
                table: "PedidosVenda");

            migrationBuilder.DropTable(
                name: "ProdutoFornecedores");

            migrationBuilder.DropTable(
                name: "ProdutoVariacoes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PedidosVenda",
                table: "PedidosVenda");

            migrationBuilder.DropIndex(
                name: "IX_PedidosVenda_ClienteId",
                table: "PedidosVenda");

            migrationBuilder.DropIndex(
                name: "IX_PedidosVenda_Codigo",
                table: "PedidosVenda");

            migrationBuilder.DropIndex(
                name: "IX_PedidosVenda_RepresentanteId",
                table: "PedidosVenda");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ItensPedido",
                table: "ItensPedido");

            migrationBuilder.DropIndex(
                name: "IX_ItensPedido_ProdutoId",
                table: "ItensPedido");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Depositos",
                table: "Depositos");

            migrationBuilder.DropColumn(
                name: "CustoPadrao",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "CustoUltimaCompra",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "DataUltimaCompra",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "ImagemUrl",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "Ncm",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "OrigemMercadoria",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "Sku",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "TipoItem",
                table: "Produtos");

            migrationBuilder.RenameTable(
                name: "PedidosVenda",
                newName: "PedidoVenda");

            migrationBuilder.RenameTable(
                name: "ItensPedido",
                newName: "ItemPedido");

            migrationBuilder.RenameTable(
                name: "Depositos",
                newName: "Deposito");

            migrationBuilder.RenameIndex(
                name: "IX_ItensPedido_PedidoVendaId",
                table: "ItemPedido",
                newName: "IX_ItemPedido_PedidoVendaId");

            migrationBuilder.RenameIndex(
                name: "IX_Depositos_AlmoxarifadoId",
                table: "Deposito",
                newName: "IX_Deposito_AlmoxarifadoId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PedidoVenda",
                table: "PedidoVenda",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItemPedido",
                table: "ItemPedido",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Deposito",
                table: "Deposito",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ContasReceber_PedidoVenda_PedidoVendaId",
                table: "ContasReceber",
                column: "PedidoVendaId",
                principalTable: "PedidoVenda",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Deposito_Almoxarifados_AlmoxarifadoId",
                table: "Deposito",
                column: "AlmoxarifadoId",
                principalTable: "Almoxarifados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItemPedido_PedidoVenda_PedidoVendaId",
                table: "ItemPedido",
                column: "PedidoVendaId",
                principalTable: "PedidoVenda",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
