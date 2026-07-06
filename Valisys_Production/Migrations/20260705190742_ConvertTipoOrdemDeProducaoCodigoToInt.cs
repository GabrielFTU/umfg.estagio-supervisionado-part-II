using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class ConvertTipoOrdemDeProducaoCodigoToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Existing "Codigo" values are free-text (e.g. "NOR") and cannot all be cast
            // directly to integer, so renumber every row sequentially by creation order
            // before converting the column type. Postgres requires an explicit USING cast
            // for text->integer, which EF's AlterColumn does not emit, so this is raw SQL.
            migrationBuilder.Sql(@"
                WITH ranked AS (
                    SELECT ""Id"", ROW_NUMBER() OVER (ORDER BY ""CriadoEm"") AS rn
                    FROM ""TiposDeOrdemDeProducao""
                )
                UPDATE ""TiposDeOrdemDeProducao"" t
                SET ""Codigo"" = ranked.rn::text
                FROM ranked
                WHERE t.""Id"" = ranked.""Id"";

                ALTER TABLE ""TiposDeOrdemDeProducao"" ALTER COLUMN ""Codigo"" DROP DEFAULT;
                ALTER TABLE ""TiposDeOrdemDeProducao"" ALTER COLUMN ""Codigo"" TYPE integer USING ""Codigo""::integer;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Codigo",
                table: "TiposDeOrdemDeProducao",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.UpdateData(
                table: "TiposDeOrdemDeProducao",
                keyColumn: "Id",
                keyValue: new Guid("c0de0000-0000-0000-0000-000000000008"),
                column: "Codigo",
                value: "NOR");
        }
    }
}
