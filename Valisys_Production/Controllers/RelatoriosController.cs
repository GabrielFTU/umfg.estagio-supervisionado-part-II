using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Services;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly IPdfReportService _pdfService;
        private readonly IOrdemDeProducaoService _ordemService;
        private readonly IMovimentacaoService _movimentacaoService;
        private readonly IProdutoService _produtoService;
        private readonly IAlmoxarifadoService _almoxarifadoService;
        private readonly ICategoriaProdutoService _categoriaService;
        private readonly IFichaTecnicaService _fichaService;
        private readonly IRoteiroProducaoService _roteiroService;
        private readonly ApplicationDbContext _context;

        public RelatoriosController(
            IPdfReportService pdfService,
            IOrdemDeProducaoService ordemService,
            IMovimentacaoService movimentacaoService,
            IProdutoService produtoService,
            IAlmoxarifadoService almoxarifadoService,
            ICategoriaProdutoService categoriaService,
            IFichaTecnicaService fichaService,
            IRoteiroProducaoService roteiroService,
            ApplicationDbContext context)
        {
            _pdfService = pdfService;
            _ordemService = ordemService;
            _movimentacaoService = movimentacaoService;
            _produtoService = produtoService;
            _almoxarifadoService = almoxarifadoService;
            _categoriaService = categoriaService;
            _fichaService = fichaService;
            _roteiroService = roteiroService;
            _context = context;
        }

        // ─── Estoque: JSON endpoints ──────────────────────────────────────────────

        [HttpGet("estoque/abaixo-minimo")]
        public async Task<IActionResult> EstoqueAbaixoMinimo(
            [FromQuery] List<Guid>? produtoId,
            [FromQuery] List<Guid>? categoriaId,
            [FromQuery] List<Guid>? depositoId)
        {
            var query = _context.Produtos
                .AsNoTracking()
                .Include(p => p.CategoriaProduto)
                .Include(p => p.UnidadeMedida)
                .Where(p => p.Ativo && p.EstoqueMinimo > 0);

            if (produtoId?.Count > 0)
                query = query.Where(p => produtoId.Contains(p.Id));
            if (categoriaId?.Count > 0)
                query = query.Where(p => categoriaId.Contains(p.CategoriaProdutoId));

            var produtos = await query.ToListAsync();
            var temDeposito = depositoId?.Count > 0;

            // Saldo por produto via movimentações (global, ou restrito aos depósitos selecionados)
            var movsQuery = _context.Movimentacoes
                .AsNoTracking()
                .Where(m => produtos.Select(p => p.Id).Contains(m.ProdutoId));

            if (temDeposito)
                movsQuery = movsQuery.Where(m => depositoId!.Contains(m.DepositoDestinoId ?? Guid.Empty) || depositoId!.Contains(m.DepositoOrigemId ?? Guid.Empty));

            var movs = await movsQuery.ToListAsync();

            var result = produtos
                .Select(p =>
                {
                    var movsP = movs.Where(m => m.ProdutoId == p.Id);
                    decimal saldo;
                    if (temDeposito)
                    {
                        var entradaDep = movsP.Where(m => m.DepositoDestinoId.HasValue && depositoId!.Contains(m.DepositoDestinoId.Value)).Sum(m => m.Quantidade);
                        var saidaDep   = movsP.Where(m => m.DepositoOrigemId.HasValue && depositoId!.Contains(m.DepositoOrigemId.Value)).Sum(m => m.Quantidade);
                        saldo = entradaDep - saidaDep;
                    }
                    else
                    {
                        var entrada = movsP.Where(m => m.Tipo == TipoMovimentacao.Entrada).Sum(m => m.Quantidade);
                        var saida   = movsP.Where(m => m.Tipo == TipoMovimentacao.Saida || m.Tipo == TipoMovimentacao.Baixa).Sum(m => m.Quantidade);
                        saldo = entrada - saida;
                    }
                    return new RelAbaixoMinimoDto
                    {
                        Id            = p.Id,
                        ProdutoNome   = p.Nome,
                        ProdutoCodigo = p.CodigoInternoProduto.ToString(),
                        CategoriaNome = p.CategoriaProduto?.Nome,
                        Unidade       = p.UnidadeMedida.Sigla,
                        EstoqueAtual  = saldo,
                        EstoqueMinimo = p.EstoqueMinimo,
                        Diferenca     = p.EstoqueMinimo - saldo,
                    };
                })
                .Where(r => r.EstoqueAtual < r.EstoqueMinimo)
                .OrderByDescending(r => r.Diferenca)
                .ToList();

            return Ok(result);
        }

        [HttpGet("estoque/saldo-produto")]
        public async Task<IActionResult> EstoqueSaldoProduto(
            [FromQuery] List<Guid>? produtoId,
            [FromQuery] List<Guid>? categoriaId,
            [FromQuery] List<Guid>? fornecedorId)
        {
            var query = _context.Produtos
                .AsNoTracking()
                .Include(p => p.CategoriaProduto)
                .Include(p => p.UnidadeMedida)
                .Include(p => p.Fornecedores)
                .Where(p => p.Ativo);

            if (produtoId?.Count > 0)
                query = query.Where(p => produtoId.Contains(p.Id));
            if (categoriaId?.Count > 0)
                query = query.Where(p => categoriaId.Contains(p.CategoriaProdutoId));
            if (fornecedorId?.Count > 0)
                query = query.Where(p => p.Fornecedores.Any(f => fornecedorId.Contains(f.PessoaId)));

            var produtos = await query.ToListAsync();

            var movs = await _context.Movimentacoes
                .AsNoTracking()
                .Where(m => produtos.Select(p => p.Id).Contains(m.ProdutoId))
                .ToListAsync();

            var result = produtos
                .Select(p =>
                {
                    var movsP   = movs.Where(m => m.ProdutoId == p.Id);
                    var entrada  = movsP.Where(m => m.Tipo == TipoMovimentacao.Entrada).Sum(m => m.Quantidade);
                    var saida    = movsP.Where(m => m.Tipo == TipoMovimentacao.Saida || m.Tipo == TipoMovimentacao.Baixa).Sum(m => m.Quantidade);
                    var saldo    = entrada - saida;
                    var custo    = p.CustoPadrao > 0 ? p.CustoPadrao : p.CustoUltimaCompra;
                    return new RelSaldoProdutoDto
                    {
                        Id            = p.Id,
                        ProdutoNome   = p.Nome,
                        ProdutoCodigo = p.CodigoInternoProduto.ToString(),
                        CategoriaNome = p.CategoriaProduto?.Nome,
                        Unidade       = p.UnidadeMedida.Sigla,
                        SaldoTotal    = saldo,
                        CustoMedio    = custo,
                        ValorTotal    = saldo * custo,
                    };
                })
                .OrderBy(r => r.ProdutoNome)
                .ToList();

            return Ok(result);
        }

        [HttpGet("estoque/saldo-deposito")]
        public async Task<IActionResult> EstoqueSaldoDeposito(
            [FromQuery] List<Guid>? produtoId,
            [FromQuery] List<Guid>? depositoId)
        {
            var movsQuery = _context.Movimentacoes
                .AsNoTracking()
                .Include(m => m.Produto).ThenInclude(p => p.UnidadeMedida)
                .Include(m => m.DepositoDestino).ThenInclude(d => d!.Almoxarifado)
                .Include(m => m.DepositoOrigem).ThenInclude(d => d!.Almoxarifado)
                .Where(m => m.DepositoDestinoId != null || m.DepositoOrigemId != null);

            if (produtoId?.Count > 0)
                movsQuery = movsQuery.Where(m => produtoId.Contains(m.ProdutoId));
            if (depositoId?.Count > 0)
                movsQuery = movsQuery.Where(m => depositoId.Contains(m.DepositoDestinoId ?? Guid.Empty) || depositoId.Contains(m.DepositoOrigemId ?? Guid.Empty));

            var movs = await movsQuery.ToListAsync();

            // Build (deposito, produto) -> saldo map
            var map = new Dictionary<(Guid dep, Guid prod), (decimal saldo, Deposito dep_obj, Produto prod_obj)>();

            void Ajustar(Guid depId, Guid prodId, decimal delta, Deposito depObj, Produto prodObj)
            {
                if (!map.TryGetValue((depId, prodId), out var v))
                    v = (0, depObj, prodObj);
                map[(depId, prodId)] = (v.saldo + delta, depObj, prodObj);
            }

            foreach (var m in movs)
            {
                if (m.DepositoDestinoId.HasValue && m.DepositoDestino != null)
                    Ajustar(m.DepositoDestinoId.Value, m.ProdutoId, m.Quantidade, m.DepositoDestino, m.Produto);
                if (m.DepositoOrigemId.HasValue && m.DepositoOrigem != null)
                    Ajustar(m.DepositoOrigemId.Value, m.ProdutoId, -m.Quantidade, m.DepositoOrigem, m.Produto);
            }

            var result = map
                .Where(kv => kv.Value.saldo != 0)
                .Select((kv, i) => new RelSaldoDepositoDto
                {
                    Id               = kv.Key.dep,
                    DepositoNome     = kv.Value.dep_obj.Nome,
                    AlmoxarifadoNome = kv.Value.dep_obj.Almoxarifado?.Nome,
                    ProdutoNome      = kv.Value.prod_obj.Nome,
                    ProdutoCodigo    = kv.Value.prod_obj.CodigoInternoProduto.ToString(),
                    Unidade          = kv.Value.prod_obj.UnidadeMedida.Sigla,
                    Saldo            = kv.Value.saldo,
                })
                .OrderBy(r => r.DepositoNome).ThenBy(r => r.ProdutoNome)
                .ToList();

            return Ok(result);
        }

        // ─── Financeiro: JSON endpoints ───────────────────────────────────────────

        [HttpGet("financeiro/contas-pagar")]
        public async Task<IActionResult> FinanceiroContasPagar(
            [FromQuery] List<StatusConta>? status,
            [FromQuery] List<Guid>? fornecedorId,
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var query = _context.ContasPagar
                .AsNoTracking()
                .Include(c => c.Fornecedor)
                .AsQueryable();

            if (status?.Count > 0)
                query = query.Where(c => status.Contains(c.Status));
            if (fornecedorId?.Count > 0)
                query = query.Where(c => c.FornecedorId.HasValue && fornecedorId.Contains(c.FornecedorId.Value));
            if (dataInicio.HasValue)
                query = query.Where(c => c.DataVencimento.Date >= dataInicio.Value.Date);
            if (dataFim.HasValue)
                query = query.Where(c => c.DataVencimento.Date <= dataFim.Value.Date);

            var contas = await query.OrderByDescending(c => c.DataVencimento).ToListAsync();

            var result = contas.Select(c => new RelContaPagarDto
            {
                Id             = c.Id,
                Codigo         = c.Codigo,
                Descricao      = c.Descricao,
                FornecedorNome = c.Fornecedor?.Nome,
                DataEmissao    = c.DataEmissao,
                DataVencimento = c.DataVencimento,
                ValorTotal     = c.ValorTotal,
                ValorPago      = c.ValorPago,
                ValorAberto    = c.ValorAberto,
                Status         = c.Status.ToString(),
            }).ToList();

            return Ok(result);
        }

        [HttpGet("financeiro/contas-receber")]
        public async Task<IActionResult> FinanceiroContasReceber(
            [FromQuery] List<StatusConta>? status,
            [FromQuery] List<Guid>? clienteId,
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var query = _context.ContasReceber
                .AsNoTracking()
                .Include(c => c.Pessoa)
                .AsQueryable();

            if (status?.Count > 0)
                query = query.Where(c => status.Contains(c.Status));
            if (clienteId?.Count > 0)
                query = query.Where(c => c.PessoaId.HasValue && clienteId.Contains(c.PessoaId.Value));
            if (dataInicio.HasValue)
                query = query.Where(c => c.DataVencimento.Date >= dataInicio.Value.Date);
            if (dataFim.HasValue)
                query = query.Where(c => c.DataVencimento.Date <= dataFim.Value.Date);

            var contas = await query.OrderByDescending(c => c.DataVencimento).ToListAsync();

            var result = contas.Select(c => new RelContaReceberDto
            {
                Id             = c.Id,
                Codigo         = c.Codigo,
                Descricao      = c.Descricao,
                ClienteNome    = c.Pessoa?.Nome,
                DataEmissao    = c.DataEmissao,
                DataVencimento = c.DataVencimento,
                ValorTotal     = c.ValorTotal,
                ValorPago      = c.ValorPago,
                ValorAberto    = c.ValorAberto,
                Status         = c.Status.ToString(),
            }).ToList();

            return Ok(result);
        }

        [HttpGet("financeiro/fluxo-caixa")]
        public async Task<IActionResult> FinanceiroFluxoCaixa(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var ptBr  = new CultureInfo("pt-BR");
            var hoje  = DateTime.UtcNow;
            var inicio = dataInicio ?? new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);
            var fim    = dataFim ?? hoje;

            var pagarPorMes = await _context.ParcelasPagar
                .Where(p => p.DataVencimento >= inicio && p.DataVencimento <= fim)
                .GroupBy(p => new { p.DataVencimento.Year, p.DataVencimento.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(p => p.Valor) })
                .ToListAsync();

            var receberPorMes = await _context.ParcelasReceber
                .Where(p => p.DataVencimento >= inicio && p.DataVencimento <= fim)
                .GroupBy(p => new { p.DataVencimento.Year, p.DataVencimento.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(p => p.Valor) })
                .ToListAsync();

            var meses = pagarPorMes.Select(x => (x.Year, x.Month))
                .Union(receberPorMes.Select(x => (x.Year, x.Month)))
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToList();

            var result = meses.Select(m =>
            {
                var pagar   = pagarPorMes.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month)?.Total ?? 0;
                var receber = receberPorMes.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month)?.Total ?? 0;
                return new RelFluxoCaixaDto
                {
                    Periodo       = $"{ptBr.DateTimeFormat.GetAbbreviatedMonthName(m.Month)}/{m.Year}",
                    TotalAPagar   = pagar,
                    TotalAReceber = receber,
                    Saldo         = receber - pagar,
                };
            }).ToList();

            return Ok(result);
        }

        // ─── Comercial: JSON endpoints ────────────────────────────────────────────

        [HttpGet("comercial/pedidos")]
        public async Task<IActionResult> ComercialPedidos(
            [FromQuery] List<StatusPedido>? status,
            [FromQuery] List<Guid>? clienteId,
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var query = _context.PedidosVenda
                .AsNoTracking()
                .Include(p => p.Cliente)
                .Include(p => p.Itens)
                .AsQueryable();

            if (status?.Count > 0)
                query = query.Where(p => status.Contains(p.Status));
            if (clienteId?.Count > 0)
                query = query.Where(p => clienteId.Contains(p.ClienteId));
            if (dataInicio.HasValue)
                query = query.Where(p => p.DataEmissao.Date >= dataInicio.Value.Date);
            if (dataFim.HasValue)
                query = query.Where(p => p.DataEmissao.Date <= dataFim.Value.Date);

            var pedidos = await query.OrderByDescending(p => p.DataEmissao).ToListAsync();

            var result = pedidos.Select(p => new RelPedidoVendaDto
            {
                Id              = p.Id,
                Codigo          = p.Codigo,
                ClienteNome     = p.Cliente.Nome,
                DataEmissao     = p.DataEmissao,
                QuantidadeItens = p.Itens.Count,
                Total           = p.Total,
                Status          = p.Status.ToString(),
            }).ToList();

            return Ok(result);
        }

        [HttpGet("comercial/vendas-por-produto")]
        public async Task<IActionResult> ComercialVendasPorProduto(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] List<Guid>? categoriaId)
        {
            var temCategoria = categoriaId?.Count > 0;
            var vendasRaw = await (
                from item in _context.ItensPedido
                join pedido in _context.PedidosVenda on item.PedidoVendaId equals pedido.Id
                join produto in _context.Produtos on item.ProdutoId equals produto.Id
                where pedido.Status != StatusPedido.Cancelado
                   && (!dataInicio.HasValue || pedido.DataEmissao.Date >= dataInicio.Value.Date)
                   && (!dataFim.HasValue || pedido.DataEmissao.Date <= dataFim.Value.Date)
                   && (!temCategoria || categoriaId!.Contains(produto.CategoriaProdutoId))
                group item by new { produto.Id, produto.Nome, produto.CodigoInternoProduto, produto.CategoriaProdutoId } into g
                select new
                {
                    g.Key.Id,
                    g.Key.Nome,
                    g.Key.CodigoInternoProduto,
                    g.Key.CategoriaProdutoId,
                    Quantidade = g.Sum(i => i.Quantidade),
                    ValorTotal = g.Sum(i => (i.ValorUnitario - i.DescontoUnitario) * i.Quantidade),
                }
            ).ToListAsync();

            var categoriaIds = vendasRaw.Select(x => x.CategoriaProdutoId).Distinct().ToList();
            var categorias = await _context.CategoriasProduto
                .Where(c => categoriaIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Nome);

            var result = vendasRaw.Select(x => new RelVendaPorProdutoDto
            {
                ProdutoId     = x.Id,
                ProdutoNome   = x.Nome,
                ProdutoCodigo = x.CodigoInternoProduto.ToString(),
                CategoriaNome = categorias.TryGetValue(x.CategoriaProdutoId, out var nome) ? nome : null,
                Quantidade    = x.Quantidade,
                ValorTotal    = x.ValorTotal,
            })
            .OrderByDescending(x => x.ValorTotal)
            .ToList();

            return Ok(result);
        }

        [HttpGet("comercial/vendas-por-cliente")]
        public async Task<IActionResult> ComercialVendasPorCliente(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var query = _context.PedidosVenda
                .AsNoTracking()
                .Include(p => p.Cliente)
                .Include(p => p.Itens)
                .Where(p => p.Status != StatusPedido.Cancelado)
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(p => p.DataEmissao.Date >= dataInicio.Value.Date);
            if (dataFim.HasValue)
                query = query.Where(p => p.DataEmissao.Date <= dataFim.Value.Date);

            var pedidos = await query.ToListAsync();

            var result = pedidos
                .GroupBy(p => new { p.ClienteId, Nome = p.Cliente.Nome })
                .Select(g => new RelVendaPorClienteDto
                {
                    ClienteId         = g.Key.ClienteId,
                    ClienteNome       = g.Key.Nome,
                    QuantidadePedidos = g.Count(),
                    ValorTotal        = g.Sum(p => p.Total),
                    TicketMedio       = g.Sum(p => p.Total) / g.Count(),
                })
                .OrderByDescending(x => x.ValorTotal)
                .ToList();

            return Ok(result);
        }

        [HttpGet("ordem-producao/{id:guid}")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GerarRelatorioOrdemProducao(Guid id)
        {
            try
            {
                var ordem = await _ordemService.GetByIdAsync(id);

                if (ordem == null)
                {
                    return NotFound(new { message = "Ordem de produção não encontrada." });
                }

                var fichas = await _fichaService.GetByProdutoIdAsync(ordem.ProdutoId);
                var fichaTecnica = fichas.FirstOrDefault(f => f.Ativo);

                if (fichaTecnica != null)
                {
                    fichaTecnica = await _fichaService.GetByIdAsync(fichaTecnica.Id);
                }

                RoteiroProducao? roteiro = null;
                if (ordem.RoteiroProducaoId.HasValue)
                {
                    roteiro = await _roteiroService.GetByIdAsync(ordem.RoteiroProducaoId.Value);
                }
                else
                {
                    var roteiros = await _roteiroService.GetAllAsync();
                    var roteiroTemp = roteiros.FirstOrDefault(r => r.ProdutoId == ordem.ProdutoId && r.Ativo);
                    if (roteiroTemp != null)
                    {
                        roteiro = await _roteiroService.GetByIdAsync(roteiroTemp.Id);
                    }
                }

                var pdfBytes = _pdfService.GerarRelatorioOrdemProducao(ordem, fichaTecnica, roteiro);

                return File(
                    pdfBytes,
                    "application/pdf",
                    $"OrdemProducao_{ordem.CodigoOrdem}_{DateTime.Now:yyyyMMdd}.pdf"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao gerar relatório.", details = ex.Message });
            }
        }

        [HttpGet("movimentacoes")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        public async Task<IActionResult> GerarRelatorioMovimentacoes(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] Guid? produtoId,
            [FromQuery] Guid? almoxarifadoId)
        {
            try
            {
                var movimentacoes = await _movimentacaoService.GetAllAsync();

                string textoPeriodo = "Todo o período";
                string textoProduto = "Todos";
                string textoAlmoxarifado = "Todos";

                if (dataInicio.HasValue)
                {
                    movimentacoes = movimentacoes.Where(m => m.DataMovimentacao.Date >= dataInicio.Value.Date);
                    textoPeriodo = $"De {dataInicio.Value:dd/MM/yyyy}";
                }

                if (dataFim.HasValue)
                {
                    movimentacoes = movimentacoes.Where(m => m.DataMovimentacao.Date <= dataFim.Value.Date);
                    textoPeriodo += $" até {dataFim.Value:dd/MM/yyyy}";
                }
                else if (dataInicio.HasValue)
                {
                    textoPeriodo += " até hoje";
                }

                if (produtoId.HasValue)
                {
                    movimentacoes = movimentacoes.Where(m => m.ProdutoId == produtoId.Value);
                    var prod = await _produtoService.GetByIdAsync(produtoId.Value);
                    textoProduto = prod != null ? $"{prod.Nome} ({prod.CodigoInternoProduto})" : "Produto não encontrado";
                }

                if (almoxarifadoId.HasValue)
                {
                    movimentacoes = movimentacoes.Where(m =>
                        m.AlmoxarifadoOrigemId == almoxarifadoId.Value ||
                        m.AlmoxarifadoDestinoId == almoxarifadoId.Value);

                    var almox = await _almoxarifadoService.GetByIdAsync(almoxarifadoId.Value);
                    textoAlmoxarifado = almox != null ? almox.Nome : "Almoxarifado não encontrado";
                }

                var pdfBytes = _pdfService.GerarRelatorioMovimentacoes(
                    movimentacoes,
                    textoPeriodo,
                    textoProduto,
                    textoAlmoxarifado
                );

                return File(
                    pdfBytes,
                    "application/pdf",
                    $"Movimentacoes_{DateTime.Now:yyyyMMdd_HHmmss}.pdf"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao gerar relatório.", details = ex.Message });
            }
        }

        [HttpGet("produtos")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        public async Task<IActionResult> GerarRelatorioProdutos(
            [FromQuery] bool? apenasAtivos = null,
            [FromQuery] Guid? categoriaId = null)
        {
            try
            {
                var produtos = await _produtoService.GetAllAsync();

                string textoStatus = "Todos";
                string textoCategoria = "Todas";

                if (apenasAtivos.HasValue)
                {
                    produtos = produtos.Where(p => p.Ativo == apenasAtivos.Value);
                    textoStatus = apenasAtivos.Value ? "Apenas Ativos" : "Apenas Inativos";
                }

                if (categoriaId.HasValue)
                {
                    produtos = produtos.Where(p => p.CategoriaProdutoId == categoriaId.Value);
                    var categoria = await _categoriaService.GetByIdAsync(categoriaId.Value);
                    textoCategoria = categoria != null ? categoria.Nome : "Categoria não encontrada";
                }

                var pdfBytes = _pdfService.GerarRelatorioProdutos(produtos, textoStatus, textoCategoria);

                return File(
                    pdfBytes,
                    "application/pdf",
                    $"CatalogoProdutos_{DateTime.Now:yyyyMMdd}.pdf"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao gerar relatório.", details = ex.Message });
            }
        }

        [HttpGet("producao")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        public async Task<IActionResult> GerarRelatorioProducao(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] StatusOrdemDeProducao? status)
        {
            try
            {
                var ordens = await _ordemService.GetAllAsync();

                string textoPeriodo = "Todo o período";
                string textoStatus = "Todos";

                if (dataInicio.HasValue)
                {
                    ordens = ordens.Where(o => o.DataInicio.Date >= dataInicio.Value.Date);
                    textoPeriodo = $"De {dataInicio.Value:dd/MM/yyyy}";
                }

                if (dataFim.HasValue)
                {
                    ordens = ordens.Where(o => o.DataInicio.Date <= dataFim.Value.Date);
                    textoPeriodo += $" até {dataFim.Value:dd/MM/yyyy}";
                }
                else if (dataInicio.HasValue)
                {
                    textoPeriodo += " até hoje";
                }

                if (status.HasValue)
                {
                    ordens = ordens.Where(o => o.Status == status.Value);
                    textoStatus = status.Value.ToString();
                }

                ordens = ordens.OrderByDescending(o => o.DataInicio);

                var pdfBytes = _pdfService.GerarRelatorioProducao(
                    ordens,
                    textoPeriodo,
                    textoStatus
                );

                return File(
                    pdfBytes,
                    "application/pdf",
                    $"RelatorioProducao_{DateTime.Now:yyyyMMdd}.pdf"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao gerar relatório.", details = ex.Message });
            }
        }

        [HttpGet("ordem-producao/{id:guid}/visualizar")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> VisualizarRelatorioOrdemProducao(Guid id)
        {
            try
            {
                var ordem = await _ordemService.GetByIdAsync(id);

                if (ordem == null)
                {
                    return NotFound(new { message = "Ordem de produção não encontrada." });
                }

                var fichas = await _fichaService.GetByProdutoIdAsync(ordem.ProdutoId);
                var fichaTecnica = fichas.FirstOrDefault(f => f.Ativo);

                if (fichaTecnica != null)
                {
                    fichaTecnica = await _fichaService.GetByIdAsync(fichaTecnica.Id);
                }

                RoteiroProducao? roteiro = null;
                if (ordem.RoteiroProducaoId.HasValue)
                {
                    roteiro = await _roteiroService.GetByIdAsync(ordem.RoteiroProducaoId.Value);
                }
                else
                {
                    var roteiros = await _roteiroService.GetAllAsync();
                    var roteiroTemp = roteiros.FirstOrDefault(r => r.ProdutoId == ordem.ProdutoId && r.Ativo);
                    if (roteiroTemp != null)
                    {
                        roteiro = await _roteiroService.GetByIdAsync(roteiroTemp.Id);
                    }
                }

                var pdfBytes = _pdfService.GerarRelatorioOrdemProducao(ordem, fichaTecnica, roteiro);

                Response.Headers.Add("Content-Disposition", "inline");
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao gerar relatório.", details = ex.Message });
            }
        }
    }
}