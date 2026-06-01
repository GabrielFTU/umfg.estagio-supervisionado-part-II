using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class OrdemDeProducaoRepository : Repository<OrdemDeProducao>, IOrdemDeProducaoRepository
    {
        public OrdemDeProducaoRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<OrdemDeProducao?> GetByIdAsync(Guid id)
            => await _dbSet.AsNoTracking()
                .Include(o => o.Lote)
                .Include(o => o.Produto).ThenInclude(p => p.UnidadeMedida)
                .Include(o => o.Almoxarifado)
                .Include(o => o.FaseAtual)
                .Include(o => o.TipoOrdemDeProducao)
                .Include(o => o.RoteiroProducao)
                .FirstOrDefaultAsync(o => o.Id == id);

        public override async Task<IEnumerable<OrdemDeProducao>> GetAllAsync()
            => await _dbSet.AsNoTracking()
                .Include(o => o.Produto)
                .Include(o => o.FaseAtual)
                .Include(o => o.Almoxarifado)
                .OrderByDescending(o => o.DataInicio)
                .Take(100)
                .ToListAsync();

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity is null) return false;
            entity.Cancelar();
            _context.Entry(entity).State = EntityState.Modified;
            try { return await _context.SaveChangesAsync() > 0; }
            catch { return false; }
        }

        public async Task<OrdemDeProducao?> GetByCodigoAsync(string codigo)
            => await _dbSet.AsNoTracking()
                .Include(o => o.Lote)
                .Include(o => o.Produto)
                .Include(o => o.FaseAtual)
                .Include(o => o.RoteiroProducao)
                .FirstOrDefaultAsync(o => o.CodigoOrdem == codigo);

        public async Task<IEnumerable<OrdemDeProducaoReadDto>> GetAllReadDtosAsync()
            => await _dbSet.AsNoTracking()
                .OrderByDescending(o => o.DataInicio)
                .Take(80)
                .Select(o => new OrdemDeProducaoReadDto
                {
                    Id = o.Id,
                    CodigoOrdem = o.CodigoOrdem,
                    Quantidade = o.Quantidade,
                    Status = o.Status,
                    DataInicio = o.DataInicio,
                    DataFim = o.DataFim,
                    Observacoes = o.Observacoes,
                    ProdutoId = o.ProdutoId,
                    ProdutoNome = o.Produto.Nome,
                    AlmoxarifadoId = o.AlmoxarifadoId,
                    AlmoxarifadoNome = o.Almoxarifado.Nome,
                    FaseAtualId = o.FaseAtualId,
                    FaseAtualNome = o.FaseAtual.Nome,
                    LoteId = o.LoteId,
                    LoteNumero = o.Lote != null ? o.Lote.CodigoLote : null,
                    RoteiroProducaoId = o.RoteiroProducaoId,
                    RoteiroCodigo = o.RoteiroProducao != null ? o.RoteiroProducao.Codigo : null
                })
                .ToListAsync();

        public async Task<int> ObterProximoSequencialAsync(int ano)
        {
            var prefixo = $"OP-{ano}-";
            var ultimoCodigo = await _dbSet.AsNoTracking()
                .Where(o => o.CodigoOrdem.StartsWith(prefixo))
                .OrderByDescending(o => o.CodigoOrdem)
                .Select(o => o.CodigoOrdem)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(ultimoCodigo)) return 1;

            return ultimoCodigo.Length > prefixo.Length &&
                   int.TryParse(ultimoCodigo[prefixo.Length..], out int seq)
                ? seq + 1 : 1;
        }
    }
}
