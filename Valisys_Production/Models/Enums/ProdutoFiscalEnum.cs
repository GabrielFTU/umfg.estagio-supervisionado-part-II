namespace Valisys_Production.Models.Enums
{
    public enum TipoItem
    {
        MercadoriaParaRevenda  = 0,
        MateriaPrima           = 1,
        Embalagem              = 2,
        ProdutoEmProcesso      = 3,
        ProdutoAcabado         = 4,
        Subproduto             = 5,
        ProdutoIntermediario   = 6,
        MaterialUsoConsumo     = 7,
        AtivoImobilizado       = 8,
        Servicos               = 9,
        OutrosInsumos          = 10,
        Outras                 = 99,
    }

    public enum OrigemMercadoria
    {
        NacionalExceto3458         = 0,
        EstrangeiraImportacaoDireta = 1,
        EstrangeiraMercadoInterno   = 2,
        NacionalConteudo40Mais      = 3,
        NacionalProcessosBasicos    = 4,
        NacionalConteudo40Menos     = 5,
        EstrangeiraImportacaoSemSimilar        = 6,
        EstrangeiraMercadoInternoSemSimilar    = 7,
        NacionalConteudo70Mais      = 8,
    }
}
