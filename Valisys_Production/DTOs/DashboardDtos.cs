using System;
using System.Collections.Generic;

namespace Valisys_Production.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalOpsAtivas { get; set; }
        public int TotalOpsFinalizadas { get; set; }
        public int TotalOpsAtrasadas { get; set; }
        public int TotalLotesAtivos { get; set; }
        public double TempoMedioProducao { get; set; }

        public List<GraficoDadosDto> OpsPorFase { get; set; } = new();
        public List<GraficoDadosDto> OpsPorMes { get; set; } = new();

        public List<OrdemAtrasadaDto> OrdensCriticas { get; set; } = new();
        public List<MovimentacaoRecenteDto> UltimasMovimentacoes { get; set; } = new();

        // Vendas / Financeiro
        public VendasResumoDto VendasResumo { get; set; } = new();
        public List<TopProdutoDto> TopProdutos { get; set; } = new();
        public Dictionary<string, int> VendasPorEstado { get; set; } = new();
        public List<FluxoSemanalDto> FluxoSemanal { get; set; } = new();
        public List<DelaysMensaisDto> RecebimentosMensais { get; set; } = new();
        public List<VendasMensaisDto> VendasMensais { get; set; } = new();
    }

    public class GraficoDadosDto
    {
        public string Nome { get; set; } = string.Empty;
        public int Valor { get; set; }
    }

    public class OrdemAtrasadaDto
    {
        public string Codigo { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public string Fase { get; set; } = string.Empty;
        public int DiasAtraso { get; set; }
    }

    public class MovimentacaoRecenteDto
    {
        public string Descricao { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string Usuario { get; set; } = string.Empty;
        public DateTime Data { get; set; }
    }

    public class VendasResumoDto
    {
        public decimal TotalVendas { get; set; }
        public int TotalPedidos { get; set; }
        public int ProdutosVendidos { get; set; }
        public int NovosClientes { get; set; }
        public double VariacaoVendas { get; set; }
        public double VariacaoPedidos { get; set; }
        public double VariacaoProdutos { get; set; }
        public double VariacaoClientes { get; set; }
    }

    public class TopProdutoDto
    {
        public string Nome { get; set; } = string.Empty;
        public int Quantidade { get; set; }
        public double Percentual { get; set; }
    }

    public class FluxoSemanalDto
    {
        public string Dia { get; set; } = string.Empty;
        public decimal AReceber { get; set; }
        public decimal APagar { get; set; }
    }

    public class DelaysMensaisDto
    {
        public string Mes { get; set; } = string.Empty;
        public int Mais15 { get; set; }
        public int Mais30 { get; set; }
    }

    public class VendasMensaisDto
    {
        public string Mes { get; set; } = string.Empty;
        public decimal Vendido { get; set; }
    }

    public class EstadoDetalhesDto
    {
        public string Sigla { get; set; } = string.Empty;
        public int TotalPedidos { get; set; }
        public decimal TotalVendas { get; set; }
        public List<TopProdutoEstadoDto> TopProdutos { get; set; } = new();
    }

    public class TopProdutoEstadoDto
    {
        public string Nome { get; set; } = string.Empty;
        public int Quantidade { get; set; }
        public decimal ValorTotal { get; set; }
    }
}
