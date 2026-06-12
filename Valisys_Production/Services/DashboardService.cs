using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Valisys_Production.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetStatsAsync()
        {
            var stats = new DashboardStatsDto();
            var hoje = DateTime.UtcNow;
            var ptBr = new CultureInfo("pt-BR");

            // ── Produção ────────────────────────────────────────────────────────

            stats.TotalOpsAtivas = await _context.OrdensDeProducao
                .CountAsync(o => o.Status == StatusOrdemDeProducao.Ativa || o.Status == StatusOrdemDeProducao.Aguardando);

            stats.TotalOpsFinalizadas = await _context.OrdensDeProducao
                .CountAsync(o => o.Status == StatusOrdemDeProducao.Finalizada);

            stats.TotalLotesAtivos = await _context.Lotes
                .CountAsync(l => l.Status == StatusLote.Pendente || l.Status == StatusLote.EmProducao);

            var opsAtivas = await _context.OrdensDeProducao
                .AsNoTracking()
                .Include(o => o.Produto)
                .Include(o => o.FaseAtual)
                .Include(o => o.RoteiroProducao).ThenInclude(r => r.Etapas)
                .Where(o => o.Status == StatusOrdemDeProducao.Ativa)
                .ToListAsync();

            var ordensAtrasadas = new List<OrdemAtrasadaDto>();
            foreach (var op in opsAtivas)
            {
                int diasEst = (op.RoteiroProducao?.Etapas.Any() == true)
                    ? op.RoteiroProducao.Etapas.Sum(e => e.TempoDias) : 7;
                var prevista = op.DataInicio.AddDays(diasEst);
                if (hoje > prevista)
                {
                    ordensAtrasadas.Add(new OrdemAtrasadaDto
                    {
                        Codigo = op.CodigoOrdem,
                        Produto = op.Produto.Nome,
                        Fase = op.FaseAtual.Nome,
                        DiasAtraso = (hoje - prevista).Days
                    });
                }
            }

            stats.TotalOpsAtrasadas = ordensAtrasadas.Count;
            stats.OrdensCriticas = ordensAtrasadas.OrderByDescending(x => x.DiasAtraso).Take(5).ToList();

            var opsFinalizadas = await _context.OrdensDeProducao
                .Where(o => o.Status == StatusOrdemDeProducao.Finalizada && o.DataFim.HasValue)
                .Select(o => new { Inicio = o.DataInicio, Fim = o.DataFim!.Value })
                .ToListAsync();

            if (opsFinalizadas.Any())
                stats.TempoMedioProducao = opsFinalizadas.Average(x => (x.Fim - x.Inicio).TotalDays);

            var opsPorFase = await _context.OrdensDeProducao
                .Where(o => o.Status == StatusOrdemDeProducao.Ativa)
                .Include(o => o.FaseAtual)
                .GroupBy(o => o.FaseAtual.Nome)
                .Select(g => new { Fase = g.Key, Qtd = g.Count() })
                .ToListAsync();

            stats.OpsPorFase = opsPorFase
                .Select(x => new GraficoDadosDto { Nome = x.Fase, Valor = x.Qtd })
                .OrderByDescending(x => x.Valor).ToList();

            var dataLimite6m = hoje.AddMonths(-6);
            var opsPorMes = await _context.OrdensDeProducao
                .Where(o => o.Status == StatusOrdemDeProducao.Finalizada && o.DataFim >= dataLimite6m)
                .GroupBy(o => new { o.DataFim!.Value.Year, o.DataFim.Value.Month })
                .Select(g => new { Ano = g.Key.Year, Mes = g.Key.Month, Qtd = g.Count() })
                .OrderBy(x => x.Ano).ThenBy(x => x.Mes)
                .ToListAsync();

            stats.OpsPorMes = opsPorMes
                .Select(x => new GraficoDadosDto { Nome = $"{x.Mes:D2}/{x.Ano}", Valor = x.Qtd })
                .ToList();

            var ultimasMovs = await _context.Movimentacoes
                .AsNoTracking()
                .Include(m => m.Produto)
                .Include(m => m.Usuario)
                .Include(m => m.AlmoxarifadoOrigem)
                .Include(m => m.AlmoxarifadoDestino)
                .OrderByDescending(m => m.DataMovimentacao)
                .Take(6)
                .ToListAsync();

            stats.UltimasMovimentacoes = ultimasMovs.Select(m => new MovimentacaoRecenteDto
            {
                Descricao = $"{m.Quantidade:N0}x {m.Produto.Nome}",
                Tipo = m.OrdemDeProducaoId != Guid.Empty ? "Produção" : "Estoque",
                Usuario = m.Usuario.Nome,
                Data = m.DataMovimentacao
            }).ToList();

            // ── Vendas – resumo mensal ───────────────────────────────────────────

            var inicioMesAtual   = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var inicioMesAnterior = inicioMesAtual.AddMonths(-1);

            // Pedidos do mês atual (não cancelados)
            var pedidosMesAtual = await _context.PedidosVenda
                .AsNoTracking()
                .Where(p => p.Status != StatusPedido.Cancelado && p.DataEmissao >= inicioMesAtual)
                .Include(p => p.Itens)
                .ToListAsync();

            // Pedidos do mês anterior
            var pedidosMesAnterior = await _context.PedidosVenda
                .AsNoTracking()
                .Where(p => p.Status != StatusPedido.Cancelado
                         && p.DataEmissao >= inicioMesAnterior
                         && p.DataEmissao < inicioMesAtual)
                .Include(p => p.Itens)
                .ToListAsync();

            decimal vendasAtual   = pedidosMesAtual.Sum(p => p.Total);
            decimal vendasAnterior = pedidosMesAnterior.Sum(p => p.Total);
            int pedidosAtual      = pedidosMesAtual.Count;
            int pedidosAnterior   = pedidosMesAnterior.Count;
            int qtdAtual          = pedidosMesAtual.SelectMany(p => p.Itens).Sum(i => i.Quantidade);
            int qtdAnterior       = pedidosMesAnterior.SelectMany(p => p.Itens).Sum(i => i.Quantidade);

            var clientesAtual   = pedidosMesAtual.Select(p => p.ClienteId).ToHashSet();
            var clientesAnterior = pedidosMesAnterior.Select(p => p.ClienteId).ToHashSet();
            var novosClientes = clientesAtual.Except(clientesAnterior).Count();
            var novosClientesAnt = clientesAnterior
                .Except(await _context.PedidosVenda
                    .Where(p => p.DataEmissao < inicioMesAnterior)
                    .Select(p => p.ClienteId)
                    .Distinct()
                    .ToListAsync())
                .Count();

            static double Variacao(decimal atual, decimal anterior) =>
                anterior == 0 ? (atual > 0 ? 100 : 0) : Math.Round((double)((atual - anterior) / anterior * 100), 1);

            stats.VendasResumo = new VendasResumoDto
            {
                TotalVendas         = vendasAtual,
                TotalPedidos        = pedidosAtual,
                ProdutosVendidos    = qtdAtual,
                NovosClientes       = novosClientes,
                VariacaoVendas      = Variacao(vendasAtual, vendasAnterior),
                VariacaoPedidos     = Variacao(pedidosAtual, pedidosAnterior),
                VariacaoProdutos    = Variacao(qtdAtual, qtdAnterior),
                VariacaoClientes    = Variacao(novosClientes, novosClientesAnt),
            };

            // ── Top produtos (últimos 30 dias) ──────────────────────────────────

            var inicio30d = hoje.AddDays(-30);
            var topRaw = await (
                from pedido in _context.PedidosVenda
                where pedido.Status != StatusPedido.Cancelado && pedido.DataEmissao >= inicio30d
                join item in _context.ItensPedido on pedido.Id equals item.PedidoVendaId
                join produto in _context.Produtos on item.ProdutoId equals produto.Id
                group item by produto.Nome into g
                orderby g.Sum(i => i.Quantidade) descending
                select new { Nome = g.Key, Quantidade = g.Sum(i => i.Quantidade) }
            ).Take(5).ToListAsync();

            var totalTopQtd = topRaw.Sum(x => x.Quantidade);
            stats.TopProdutos = topRaw.Select(x => new TopProdutoDto
            {
                Nome       = x.Nome,
                Quantidade = x.Quantidade,
                Percentual = totalTopQtd > 0 ? Math.Round((double)x.Quantidade / totalTopQtd * 100, 1) : 0
            }).ToList();

            // ── Vendas por estado ───────────────────────────────────────────────

            var vendasEstado = await (
                from pedido in _context.PedidosVenda
                join pessoa in _context.Pessoas on pedido.ClienteId equals pessoa.Id
                where pedido.Status != StatusPedido.Cancelado && pessoa.Endereco != null
                group pedido by pessoa.Endereco!.Uf into g
                select new { Uf = g.Key, Count = g.Count() }
            ).ToListAsync();

            stats.VendasPorEstado = vendasEstado
                .Where(x => !string.IsNullOrEmpty(x.Uf))
                .ToDictionary(x => x.Uf.ToUpper(), x => x.Count);

            // ── Fluxo semanal (últimos 7 dias) ──────────────────────────────────

            var dias = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };
            var inicio7d = hoje.AddDays(-6).Date;

            var parcelasReceber = await _context.ParcelasReceber
                .Where(p => p.DataVencimento >= inicio7d)
                .Select(p => new { p.DataVencimento, p.Valor })
                .ToListAsync();

            var parcelasPagar = await _context.ParcelasPagar
                .Where(p => p.DataVencimento >= inicio7d)
                .Select(p => new { p.DataVencimento, p.Valor })
                .ToListAsync();

            stats.FluxoSemanal = Enumerable.Range(0, 7).Select(i =>
            {
                var dia = inicio7d.AddDays(i);
                return new FluxoSemanalDto
                {
                    Dia      = dias[(int)dia.DayOfWeek],
                    AReceber = parcelasReceber.Where(p => p.DataVencimento.Date == dia).Sum(p => p.Valor),
                    APagar   = parcelasPagar.Where(p => p.DataVencimento.Date == dia).Sum(p => p.Valor),
                };
            }).ToList();

            // ── Recebimentos com atraso (últimos 12 meses) ──────────────────────

            var dataLimite12m = hoje.AddMonths(-12);
            var parcVencidas = await _context.ParcelasReceber
                .Where(p => p.DataVencimento >= dataLimite12m && p.Status == StatusParcela.Vencido)
                .Select(p => new { p.DataVencimento })
                .ToListAsync();

            var hojeDate = hoje.Date;
            stats.RecebimentosMensais = parcVencidas
                .GroupBy(p => new { p.DataVencimento.Year, p.DataVencimento.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new DelaysMensaisDto
                {
                    Mes    = ptBr.DateTimeFormat.GetAbbreviatedMonthName(g.Key.Month),
                    Mais15 = g.Count(p => (hojeDate - p.DataVencimento.Date).Days >= 15),
                    Mais30 = g.Count(p => (hojeDate - p.DataVencimento.Date).Days >= 30),
                }).ToList();

            // ── Vendas mensais (últimos 7 meses) ────────────────────────────────

            var inicio7m = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-6);
            var vendasMensaisRaw = await (
                from pedido in _context.PedidosVenda
                where pedido.Status != StatusPedido.Cancelado && pedido.DataEmissao >= inicio7m
                join item in _context.ItensPedido on pedido.Id equals item.PedidoVendaId
                group new { pedido, item } by new { pedido.DataEmissao.Year, pedido.DataEmissao.Month } into g
                orderby g.Key.Year, g.Key.Month
                select new
                {
                    g.Key.Year, g.Key.Month,
                    Total = g.Sum(x => (x.item.ValorUnitario - x.item.DescontoUnitario) * x.item.Quantidade)
                }
            ).ToListAsync();

            stats.VendasMensais = vendasMensaisRaw.Select(x => new VendasMensaisDto
            {
                Mes     = ptBr.DateTimeFormat.GetAbbreviatedMonthName(x.Month),
                Vendido = x.Total,
            }).ToList();

            return stats;
        }

        public async Task<EstadoDetalhesDto> GetEstadoDetalhesAsync(string sigla)
        {
            sigla = sigla.ToUpper();

            var pedidosDoEstado = await (
                from pedido in _context.PedidosVenda
                join pessoa in _context.Pessoas on pedido.ClienteId equals pessoa.Id
                where pedido.Status != StatusPedido.Cancelado
                   && pessoa.Endereco != null
                   && pessoa.Endereco.Uf.ToUpper() == sigla
                select pedido.Id
            ).ToListAsync();

            var totalPedidos = pedidosDoEstado.Count;

            var totalVendas = await (
                from pedido in _context.PedidosVenda
                join pessoa in _context.Pessoas on pedido.ClienteId equals pessoa.Id
                where pedido.Status != StatusPedido.Cancelado
                   && pessoa.Endereco != null
                   && pessoa.Endereco.Uf.ToUpper() == sigla
                join item in _context.ItensPedido on pedido.Id equals item.PedidoVendaId
                select (item.ValorUnitario - item.DescontoUnitario) * item.Quantidade
            ).SumAsync();

            var topProdutos = await (
                from pedido in _context.PedidosVenda
                join pessoa in _context.Pessoas on pedido.ClienteId equals pessoa.Id
                where pedido.Status != StatusPedido.Cancelado
                   && pessoa.Endereco != null
                   && pessoa.Endereco.Uf.ToUpper() == sigla
                join item in _context.ItensPedido on pedido.Id equals item.PedidoVendaId
                join produto in _context.Produtos on item.ProdutoId equals produto.Id
                group item by produto.Nome into g
                orderby g.Sum(i => i.Quantidade) descending
                select new TopProdutoEstadoDto
                {
                    Nome       = g.Key,
                    Quantidade = g.Sum(i => i.Quantidade),
                    ValorTotal = g.Sum(i => (i.ValorUnitario - i.DescontoUnitario) * i.Quantidade),
                }
            ).Take(5).ToListAsync();

            return new EstadoDetalhesDto
            {
                Sigla        = sigla,
                TotalPedidos = totalPedidos,
                TotalVendas  = totalVendas,
                TopProdutos  = topProdutos,
            };
        }
    }
}
