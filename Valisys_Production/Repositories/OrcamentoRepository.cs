using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class OrcamentoRepository : Repository<Orcamento>, IOrcamentoRepository
    {
        public OrcamentoRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Orcamento?> GetByIdWithItensAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(o => o.Itens)
                    .ThenInclude(i => i.Produto)
                        .ThenInclude(p => p.UnidadeMedida)
                .Include(o => o.Cliente)
                .Include(o => o.Representante)
                .FirstOrDefaultAsync(o => o.Id == id);

        public async Task<(IEnumerable<Orcamento> Items, int TotalCount)> GetPagedAsync(OrcamentoPagedQueryDto query)
        {
            var q = _dbSet.AsNoTracking()
                .Include(o => o.Cliente)
                .Include(o => o.Representante)
                .Include(o => o.Itens)
                    .ThenInclude(i => i.Produto)
                .AsQueryable();

            if (query.Status.HasValue)
                q = q.Where(o => o.Status == query.Status.Value);

            if (query.ClienteId.HasValue)
                q = q.Where(o => o.ClienteId == query.ClienteId.Value);

            if (query.RepresentanteId.HasValue)
                q = q.Where(o => o.RepresentanteId == query.RepresentanteId.Value);

            var total = await q.CountAsync();

            var pageSize = Math.Clamp(query.PageSize, 1, 100);
            var page     = Math.Max(1, query.Page);

            var items = await q
                .OrderByDescending(o => o.DataEmissao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<int> GetProximoCodigoAsync()
        {
            var ultimo = await _dbSet.AsNoTracking()
                .OrderByDescending(o => o.Codigo)
                .Select(o => o.Codigo)
                .FirstOrDefaultAsync();
            return ultimo + 1;
        }

        public async Task<bool> UpdateWithItensAsync(Orcamento orcamento, List<ItemOrcamento> novosItens)
        {
            var existente = await _dbSet
                .Include(o => o.Itens)
                .FirstOrDefaultAsync(o => o.Id == orcamento.Id);

            if (existente is null) return false;

            _context.Entry(existente).CurrentValues.SetValues(orcamento);
            _context.ItensOrcamento.RemoveRange(existente.Itens);
            existente.LimparItens();

            foreach (var item in novosItens)
                existente.AdicionarItem(item.ProdutoId, item.Quantidade, item.ValorUnitario, item.DescontoUnitario);

            // Itens recém-criados já têm um Id (Guid) atribuído no construtor e são
            // descobertos por fixup automático (não por Add explícito): o EF assume por
            // padrão que uma chave já preenchida pertence a uma linha existente e gera
            // UPDATE em vez de INSERT. Forçar o estado evita DbUpdateConcurrencyException.
            foreach (var novo in existente.Itens)
                _context.Entry(novo).State = EntityState.Added;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> AtualizarStatusAsync(Guid id, StatusOrcamento novoStatus, Guid? pedidoVendaId = null)
        {
            int count;
            if (pedidoVendaId.HasValue)
            {
                var pId = pedidoVendaId.Value;
                count = await _dbSet.Where(o => o.Id == id).ExecuteUpdateAsync(s => s
                    .SetProperty(o => o.Status, novoStatus)
                    .SetProperty(o => o.PedidoVendaConvertidoId, (Guid?)pId)
                    .SetProperty(o => o.AtualizadoEm, (DateTime?)DateTime.UtcNow));
            }
            else
            {
                count = await _dbSet.Where(o => o.Id == id).ExecuteUpdateAsync(s => s
                    .SetProperty(o => o.Status, novoStatus)
                    .SetProperty(o => o.AtualizadoEm, (DateTime?)DateTime.UtcNow));
            }
            return count > 0;
        }
    }
}
