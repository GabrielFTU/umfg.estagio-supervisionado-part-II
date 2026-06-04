using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Valisys_Production.Migrations
{
    /// <inheritdoc />
    public partial class SeedProdutosGenericos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$
                DECLARE
                    next_code   int;
                    cat_id      uuid := 'c0de0000-0000-0000-0000-000000000006';
                    un_id       uuid := 'c0de0000-0000-0000-0000-000000000002';
                    kg_id       uuid := 'c0de0000-0000-0000-0000-000000000003';
                    now_ts      timestamptz := now();
                BEGIN
                    SELECT COALESCE(MAX("CodigoInternoProduto"), 0)
                    INTO next_code
                    FROM "Produtos";

                    INSERT INTO "Produtos" (
                        "Id", "Nome", "Descricao", "CodigoInternoProduto",
                        "Classificacao", "ControlarPorLote", "EstoqueMinimo",
                        "Ativo", "DataCadastro", "CriadoEm",
                        "UnidadeMedidaId", "CategoriaProdutoId"
                    ) VALUES
                    (
                        gen_random_uuid(),
                        'Chapa de Aço 1020',
                        'Chapa de aço carbono 1020 laminada a frio. Aplicações gerais em estruturas e componentes mecânicos.',
                        next_code + 1,
                        0, false, 50, true, now_ts, now_ts, kg_id, cat_id
                    ),
                    (
                        gen_random_uuid(),
                        'Parafuso Sextavado M8x25',
                        'Parafuso sextavado M8x25mm em aço carbono grau 8.8 com tratamento anticorrosivo zincado.',
                        next_code + 2,
                        1, false, 200, true, now_ts, now_ts, un_id, cat_id
                    ),
                    (
                        gen_random_uuid(),
                        'Tinta Epóxi Preta 900mL',
                        'Tinta epóxi bicomponente de alta resistência química e mecânica. Cor preto fosco.',
                        next_code + 3,
                        4, false, 10, true, now_ts, now_ts, un_id, cat_id
                    ),
                    (
                        gen_random_uuid(),
                        'Motor Elétrico 1CV 220V',
                        'Motor elétrico monofásico 1CV 220V 1750 RPM com proteção IP55. Uso geral industrial.',
                        next_code + 4,
                        3, false, 2, true, now_ts, now_ts, un_id, cat_id
                    ),
                    (
                        gen_random_uuid(),
                        'Eixo de Aço Inox 25mm',
                        'Eixo torneado em aço inox AISI 304, diâmetro 25mm, comprimento padrão 1000mm.',
                        next_code + 5,
                        2, false, 5, true, now_ts, now_ts, kg_id, cat_id
                    );
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "Produtos"
                WHERE "Nome" IN (
                    'Chapa de Aço 1020',
                    'Parafuso Sextavado M8x25',
                    'Tinta Epóxi Preta 900mL',
                    'Motor Elétrico 1CV 220V',
                    'Eixo de Aço Inox 25mm'
                );
                """);
        }
    }
}
