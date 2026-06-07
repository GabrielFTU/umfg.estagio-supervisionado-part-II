namespace Valisys_Production.Infrastructure.Authorization
{
    public static class Permissions
    {
        public static class Produtos
        {
            public const string Visualizar = "Produtos.Visualizar";
            public const string Criar = "Produtos.Criar";
            public const string Editar = "Produtos.Editar";
            public const string Inativar = "Produtos.Inativar";
        }

        public static class Categorias
        {
            public const string Visualizar = "Categorias.Visualizar";
            public const string Criar = "Categorias.Criar";
            public const string Editar = "Categorias.Editar";
            public const string Inativar = "Categorias.Inativar";
        }

        public static class Fornecedores
        {
            public const string Visualizar = "Fornecedores.Visualizar";
            public const string Criar = "Fornecedores.Criar";
            public const string Editar = "Fornecedores.Editar";
            public const string Inativar = "Fornecedores.Inativar";
        }

        public static class Almoxarifados
        {
            public const string Visualizar = "Almoxarifados.Visualizar";
            public const string Criar = "Almoxarifados.Criar";
            public const string Editar = "Almoxarifados.Editar";
            public const string Inativar = "Almoxarifados.Inativar";
        }

        public static class Lotes
        {
            public const string Visualizar = "Lotes.Visualizar";
            public const string Criar = "Lotes.Criar";
            public const string Editar = "Lotes.Editar";
            public const string Cancelar = "Lotes.Cancelar";
        }

        public static class OrdensProducao
        {
            public const string Visualizar = "OrdensProducao.Visualizar";
            public const string Criar = "OrdensProducao.Criar";
            public const string Editar = "OrdensProducao.Editar";
            public const string Cancelar = "OrdensProducao.Cancelar";
            public const string Finalizar = "OrdensProducao.Finalizar";
            public const string AvancarFase = "OrdensProducao.AvancarFase";
        }

        public static class Solicitacoes
        {
            public const string Visualizar = "Solicitacoes.Visualizar";
            public const string Criar = "Solicitacoes.Criar";
            public const string Aprovar = "Solicitacoes.Aprovar";
            public const string Cancelar = "Solicitacoes.Cancelar";
        }

        public static class Movimentacoes
        {
            public const string Visualizar = "Movimentacoes.Visualizar";
            public const string Criar = "Movimentacoes.Criar";
            public const string Editar = "Movimentacoes.Editar";
            public const string Excluir = "Movimentacoes.Excluir";
        }

        public static class FichasTecnicas
        {
            public const string Visualizar = "FichasTecnicas.Visualizar";
            public const string Criar = "FichasTecnicas.Criar";
            public const string Editar = "FichasTecnicas.Editar";
            public const string Inativar = "FichasTecnicas.Inativar";
        }

        public static class Roteiros
        {
            public const string Visualizar = "Roteiros.Visualizar";
            public const string Criar = "Roteiros.Criar";
            public const string Editar = "Roteiros.Editar";
            public const string Excluir = "Roteiros.Excluir";
        }

        public static class FasesProducao
        {
            public const string Visualizar = "FasesProducao.Visualizar";
            public const string Criar = "FasesProducao.Criar";
            public const string Editar = "FasesProducao.Editar";
            public const string Excluir = "FasesProducao.Excluir";
        }

        public static class Usuarios
        {
            public const string Visualizar = "Usuarios.Visualizar";
            public const string Criar = "Usuarios.Criar";
            public const string Editar = "Usuarios.Editar";
            public const string Excluir = "Usuarios.Excluir";
        }

        public static class Perfis
        {
            public const string Visualizar = "Perfis.Visualizar";
            public const string Criar = "Perfis.Criar";
            public const string Editar = "Perfis.Editar";
            public const string Excluir = "Perfis.Excluir";
        }

        public static class UnidadesMedida
        {
            public const string Visualizar = "UnidadesMedida.Visualizar";
            public const string Criar = "UnidadesMedida.Criar";
            public const string Editar = "UnidadesMedida.Editar";
            public const string Excluir = "UnidadesMedida.Excluir";
        }

        public static class TiposOrdem
        {
            public const string Visualizar = "TiposOrdem.Visualizar";
            public const string Criar = "TiposOrdem.Criar";
            public const string Editar = "TiposOrdem.Editar";
            public const string Excluir = "TiposOrdem.Excluir";
        }

        public static class Relatorios
        {
            public const string Visualizar = "Relatorios.Visualizar";
        }

        public static class Dashboard
        {
            public const string Visualizar = "Dashboard.Visualizar";
        }

        public static class Estoque
        {
            public const string Visualizar = "Estoque.Visualizar";
        }

        public static class Finalidades
        {
            public const string Visualizar = "Finalidades.Visualizar";
            public const string Criar      = "Finalidades.Criar";
            public const string Editar     = "Finalidades.Editar";
            public const string Inativar   = "Finalidades.Inativar";
        }

        public static class CondicoesPagamento
        {
            public const string Visualizar = "CondicoesPagamento.Visualizar";
            public const string Criar      = "CondicoesPagamento.Criar";
            public const string Editar     = "CondicoesPagamento.Editar";
            public const string Inativar   = "CondicoesPagamento.Inativar";
        }

        public static class FormasPagamento
        {
            public const string Visualizar = "FormasPagamento.Visualizar";
            public const string Criar      = "FormasPagamento.Criar";
            public const string Editar     = "FormasPagamento.Editar";
            public const string Inativar   = "FormasPagamento.Inativar";
        }

        public static class PedidosVenda
        {
            public const string Visualizar = "PedidosVenda.Visualizar";
            public const string Criar = "PedidosVenda.Criar";
            public const string Editar = "PedidosVenda.Editar";
            public const string Confirmar = "PedidosVenda.Confirmar";
            public const string Cancelar = "PedidosVenda.Cancelar";
            public const string Concluir = "PedidosVenda.Concluir";
        }

        public static class Logs
        {
            public const string Visualizar = "Logs.Visualizar";
        }

        public static IReadOnlyList<string> Todas() =>
        [
            Finalidades.Visualizar, Finalidades.Criar, Finalidades.Editar, Finalidades.Inativar,
            CondicoesPagamento.Visualizar, CondicoesPagamento.Criar, CondicoesPagamento.Editar, CondicoesPagamento.Inativar,
            FormasPagamento.Visualizar, FormasPagamento.Criar, FormasPagamento.Editar, FormasPagamento.Inativar,
            PedidosVenda.Visualizar, PedidosVenda.Criar, PedidosVenda.Editar,
            PedidosVenda.Confirmar, PedidosVenda.Cancelar, PedidosVenda.Concluir,
            Produtos.Visualizar, Produtos.Criar, Produtos.Editar, Produtos.Inativar,
            Categorias.Visualizar, Categorias.Criar, Categorias.Editar, Categorias.Inativar,
            Fornecedores.Visualizar, Fornecedores.Criar, Fornecedores.Editar, Fornecedores.Inativar,
            Almoxarifados.Visualizar, Almoxarifados.Criar, Almoxarifados.Editar, Almoxarifados.Inativar,
            Lotes.Visualizar, Lotes.Criar, Lotes.Editar, Lotes.Cancelar,
            OrdensProducao.Visualizar, OrdensProducao.Criar, OrdensProducao.Editar,
            OrdensProducao.Cancelar, OrdensProducao.Finalizar, OrdensProducao.AvancarFase,
            Solicitacoes.Visualizar, Solicitacoes.Criar, Solicitacoes.Aprovar, Solicitacoes.Cancelar,
            Movimentacoes.Visualizar, Movimentacoes.Criar, Movimentacoes.Editar, Movimentacoes.Excluir,
            FichasTecnicas.Visualizar, FichasTecnicas.Criar, FichasTecnicas.Editar, FichasTecnicas.Inativar,
            Roteiros.Visualizar, Roteiros.Criar, Roteiros.Editar, Roteiros.Excluir,
            FasesProducao.Visualizar, FasesProducao.Criar, FasesProducao.Editar, FasesProducao.Excluir,
            Usuarios.Visualizar, Usuarios.Criar, Usuarios.Editar, Usuarios.Excluir,
            Perfis.Visualizar, Perfis.Criar, Perfis.Editar, Perfis.Excluir,
            UnidadesMedida.Visualizar, UnidadesMedida.Criar, UnidadesMedida.Editar, UnidadesMedida.Excluir,
            TiposOrdem.Visualizar, TiposOrdem.Criar, TiposOrdem.Editar, TiposOrdem.Excluir,
            Relatorios.Visualizar, Dashboard.Visualizar, Estoque.Visualizar, Logs.Visualizar
        ];
    }
}