using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Valisys_Production.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedPerfisVendedorGerente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Perfis",
                columns: new[] { "Id", "Acessos", "Ativo", "AtualizadoEm", "AtualizadoPor", "CriadoEm", "CriadoPor", "DataCadastro", "DesativadoEm", "Nome" },
                values: new object[,]
                {
                    { new Guid("c0de0000-0000-0000-0000-000000000050"), "Dashboard.Visualizar,Almoxarifados.Visualizar,Almoxarifados.Criar,Almoxarifados.Editar,Almoxarifados.Inativar,Categorias.Visualizar,Categorias.Criar,Categorias.Editar,Categorias.Inativar,CondicoesPagamento.Visualizar,CondicoesPagamento.Criar,CondicoesPagamento.Editar,CondicoesPagamento.Inativar,Depositos.Visualizar,Depositos.Criar,Depositos.Editar,Depositos.Excluir,FasesProducao.Visualizar,FasesProducao.Criar,FasesProducao.Editar,FasesProducao.Excluir,Finalidades.Visualizar,Finalidades.Criar,Finalidades.Editar,Finalidades.Inativar,FormasPagamento.Visualizar,FormasPagamento.Criar,FormasPagamento.Editar,FormasPagamento.Inativar,TiposOrdem.Visualizar,TiposOrdem.Criar,TiposOrdem.Editar,TiposOrdem.Excluir,UnidadesMedida.Visualizar,UnidadesMedida.Criar,UnidadesMedida.Editar,UnidadesMedida.Excluir,Fornecedores.Visualizar,Fornecedores.Criar,Fornecedores.Editar,Fornecedores.Inativar,Produtos.Visualizar,Produtos.Criar,Produtos.Editar,Produtos.Inativar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir,FichasTecnicas.Visualizar,FichasTecnicas.Criar,FichasTecnicas.Editar,FichasTecnicas.Inativar,Roteiros.Visualizar,Roteiros.Criar,Roteiros.Editar,Roteiros.Excluir,Estoque.Visualizar,Movimentacoes.Visualizar,Movimentacoes.Criar,Movimentacoes.Editar,Movimentacoes.Excluir,Financeiro.Visualizar,Lotes.Visualizar,Lotes.Criar,Lotes.Editar,Lotes.Cancelar,OrdensProducao.Visualizar,OrdensProducao.Criar,OrdensProducao.Editar,OrdensProducao.Cancelar,OrdensProducao.Finalizar,OrdensProducao.AvancarFase,OrdensProducao.Estornar,Solicitacoes.Visualizar,Solicitacoes.Criar,Solicitacoes.Aprovar,Solicitacoes.Cancelar,Relatorios.Visualizar", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gerente" },
                    { new Guid("c0de0000-0000-0000-0000-000000000051"), "Dashboard.Visualizar,Produtos.Visualizar,Fornecedores.Visualizar,Orcamentos.Visualizar,Orcamentos.Criar,Orcamentos.Editar,Orcamentos.Enviar,Orcamentos.Aprovar,Orcamentos.Cancelar,Orcamentos.ConverterEmPedido,PedidosVenda.Visualizar,PedidosVenda.Criar,PedidosVenda.Editar,PedidosVenda.Confirmar,PedidosVenda.Cancelar,PedidosVenda.Concluir", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Vendedor" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000050"));

            migrationBuilder.DeleteData(
                table: "Perfis",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000051"));
        }
    }
}
