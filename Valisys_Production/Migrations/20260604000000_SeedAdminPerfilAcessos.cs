using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminPerfilAcessos : Migration
    {
        private const string AdminPerfilId = "c0de0000-0000-0000-0000-000000000001";

        private const string TodasPermissoes =
            "Produtos.Visualizar,Produtos.Criar,Produtos.Editar,Produtos.Inativar," +
            "Categorias.Visualizar,Categorias.Criar,Categorias.Editar,Categorias.Inativar," +
            "Fornecedores.Visualizar,Fornecedores.Criar,Fornecedores.Editar,Fornecedores.Inativar," +
            "Almoxarifados.Visualizar,Almoxarifados.Criar,Almoxarifados.Editar,Almoxarifados.Inativar," +
            "Lotes.Visualizar,Lotes.Criar,Lotes.Editar,Lotes.Cancelar," +
            "OrdensProducao.Visualizar,OrdensProducao.Criar,OrdensProducao.Editar," +
            "OrdensProducao.Cancelar,OrdensProducao.Finalizar,OrdensProducao.AvancarFase," +
            "Solicitacoes.Visualizar,Solicitacoes.Criar,Solicitacoes.Aprovar,Solicitacoes.Cancelar," +
            "Movimentacoes.Visualizar,Movimentacoes.Criar,Movimentacoes.Editar,Movimentacoes.Excluir," +
            "FichasTecnicas.Visualizar,FichasTecnicas.Criar,FichasTecnicas.Editar,FichasTecnicas.Inativar," +
            "Roteiros.Visualizar,Roteiros.Criar,Roteiros.Editar,Roteiros.Excluir," +
            "FasesProducao.Visualizar,FasesProducao.Criar,FasesProducao.Editar,FasesProducao.Excluir," +
            "Usuarios.Visualizar,Usuarios.Criar,Usuarios.Editar,Usuarios.Excluir," +
            "Perfis.Visualizar,Perfis.Criar,Perfis.Editar,Perfis.Excluir," +
            "UnidadesMedida.Visualizar,UnidadesMedida.Criar,UnidadesMedida.Editar,UnidadesMedida.Excluir," +
            "TiposOrdem.Visualizar,TiposOrdem.Criar,TiposOrdem.Editar,TiposOrdem.Excluir," +
            "Relatorios.Visualizar,Dashboard.Visualizar,Estoque.Visualizar,Logs.Visualizar";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // A migration inicial criou a coluna como text[] mas o modelo EF usa HasConversion
            // para text (string separada por vírgula). Corrigir o tipo primeiro.
            migrationBuilder.Sql("""
                ALTER TABLE "Perfis"
                ALTER COLUMN "Acessos" TYPE text
                USING array_to_string("Acessos", ',');
                """);

            migrationBuilder.Sql($"""
                UPDATE "Perfis"
                SET "Acessos" = '{TodasPermissoes}'
                WHERE "Id" = '{AdminPerfilId}';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($"""
                UPDATE "Perfis"
                SET "Acessos" = ''
                WHERE "Id" = '{AdminPerfilId}';
                """);

            migrationBuilder.Sql("""
                ALTER TABLE "Perfis"
                ALTER COLUMN "Acessos" TYPE text[]
                USING string_to_array("Acessos", ',');
                """);
        }
    }
}
