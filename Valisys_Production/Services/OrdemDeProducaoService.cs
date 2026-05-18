using Microsoft.EntityFrameworkCore;
using Valisys_Production.Data;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class OrdemDeProducaoService : IOrdemDeProducaoService
    {
        private readonly IOrdemDeProducaoRepository _repository;
        private readonly IProdutoRepository _produtoRepository;
        private readonly IMovimentacaoRepository _movimentacaoRepository;
        private readonly IRoteiroProducaoRepository _roteiroRepository;
        private readonly ILoteRepository _loteRepository;
        private readonly ApplicationDbContext _context;
        private readonly IAlmoxarifadoRepository _almoxarifadoRepository;
        private readonly ILogSistemaService _logService;

        public OrdemDeProducaoService(
            IOrdemDeProducaoRepository repository,
            IProdutoRepository produtoRepository,
            IMovimentacaoRepository movimentacaoRepository,
            IRoteiroProducaoRepository roteiroRepository,
            ILoteRepository loteRepository,
            ApplicationDbContext context,
            IAlmoxarifadoRepository almoxarifadoRepository,
            ILogSistemaService logService)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
            _movimentacaoRepository = movimentacaoRepository;
            _roteiroRepository = roteiroRepository;
            _loteRepository = loteRepository;
            _context = context;
            _almoxarifadoRepository = almoxarifadoRepository;
            _logService = logService;
        }

        private async Task<Almoxarifado> GetAlmoxarifadoPrincipalAsync()
        {
            var almoxarifados = await _almoxarifadoRepository.GetAllAsync();
            return almoxarifados.FirstOrDefault() ?? throw new InvalidOperationException("Nenhum almoxarifado cadastrado.");
        }

        public async Task<OrdemDeProducao> CreateAsync(OrdemDeProducaoCreateDto dto, Guid usuarioId)
        {
            var produto = await _produtoRepository.GetByIdAsync(dto.ProdutoId);
            if (produto == null) throw new KeyNotFoundException("Produto não encontrado.");
            if (produto.ControlarPorLote && dto.LoteId == null) throw new ArgumentException("Produto exige lote.");

            var faseAtualId = dto.FaseAtualId ?? Guid.Empty;
            var ordem = new OrdemDeProducao(dto.Quantidade, dto.ProdutoId, dto.AlmoxarifadoId,
                faseAtualId, dto.TipoOrdemDeProducaoId, dto.LoteId, dto.Observacoes);

            var anoAtual = DateTime.UtcNow.Year;
            var sequencial = await _repository.ObterProximoSequencialAsync(anoAtual);
            ordem.DefinirCodigo($"OP-{anoAtual}-{sequencial:D4}");

            var almoxarifadoMP = await GetAlmoxarifadoPrincipalAsync();
            await ValidarLoteUnicoAsync(dto.LoteId);
            await ConfigurarRoteiroInicialAsync(ordem);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var novaOrdem = await _repository.AddAsync(ordem);

                if (novaOrdem.LoteId.HasValue)
                {
                    var lote = await _loteRepository.GetByIdAsync(novaOrdem.LoteId.Value);
                    if (lote != null)
                    {
                        lote.IniciarProducao();
                        await _loteRepository.UpdateAsync(lote);
                    }
                }

                var mov = new Movimentacao(
                    novaOrdem.ProdutoId, novaOrdem.Quantidade,
                    almoxarifadoMP.Id, novaOrdem.AlmoxarifadoId,
                    usuarioId, DateTime.UtcNow,
                    $"Início de Produção OP: {novaOrdem.CodigoOrdem}",
                    novaOrdem.Id);
                await _movimentacaoRepository.AddAsync(mov);
                await transaction.CommitAsync();

                await _logService.RegistrarAsync("Criação", "Produção",
                    $"Iniciou a OP {novaOrdem.CodigoOrdem} para o produto {produto.Nome}", usuarioId);

                return novaOrdem;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task FinalizarOrdemAsync(Guid ordemId, Guid usuarioId)
        {
            var ordem = await _repository.GetByIdAsync(ordemId);
            if (ordem == null) throw new KeyNotFoundException("Ordem não encontrada.");
            if (ordem.Status == StatusOrdemDeProducao.Finalizada) return;

            var almoxarifadoMP = await GetAlmoxarifadoPrincipalAsync();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                ordem.Finalizar();

                if (ordem.LoteId.HasValue)
                {
                    var lote = await _loteRepository.GetByIdAsync(ordem.LoteId.Value);
                    if (lote != null)
                    {
                        lote.Concluir();
                        await _loteRepository.UpdateAsync(lote);
                    }
                }

                var mov = new Movimentacao(
                    ordem.ProdutoId, ordem.Quantidade,
                    almoxarifadoMP.Id, ordem.AlmoxarifadoId,
                    usuarioId, DateTime.UtcNow,
                    $"Finalização OP: {ordem.CodigoOrdem}",
                    ordem.Id);
                await _movimentacaoRepository.AddAsync(mov);

                ordem.LimparNavegacoes();
                await _repository.UpdateAsync(ordem);
                await transaction.CommitAsync();

                await _logService.RegistrarAsync("Finalização", "Produção",
                    $"Concluiu a produção da OP {ordem.CodigoOrdem}", usuarioId);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> MovimentarProximaFaseAsync(Guid ordemId, Guid usuarioId)
        {
            var ordem = await _repository.GetByIdAsync(ordemId);
            if (ordem == null) throw new KeyNotFoundException("Ordem não encontrada.");

            var roteiro = await _roteiroRepository.GetByIdAsync(ordem.RoteiroProducaoId ?? Guid.Empty);
            if (roteiro == null) throw new InvalidOperationException("Roteiro inválido.");

            var etapas = roteiro.Etapas.OrderBy(e => e.Ordem).ToList();
            var etapaAtual = etapas.FirstOrDefault(e => e.FaseProducaoId == ordem.FaseAtualId);

            ordem.LimparNavegacoes();

            if (etapaAtual == null)
            {
                ordem.AvancarFase(etapas.First().FaseProducaoId);
                var res = await _repository.UpdateAsync(ordem);
                if (res) await _logService.RegistrarAsync("Movimentação", "Produção",
                    $"Reiniciou fase da OP {ordem.CodigoOrdem}", usuarioId);
                return res;
            }
            else
            {
                var index = etapas.IndexOf(etapaAtual);
                if (index >= etapas.Count - 1)
                {
                    await FinalizarOrdemAsync(ordemId, usuarioId);
                    return true;
                }

                ordem.AvancarFase(etapas[index + 1].FaseProducaoId);
                var res = await _repository.UpdateAsync(ordem);

                if (res) await _logService.RegistrarAsync("Movimentação", "Produção",
                    $"Avançou OP {ordem.CodigoOrdem} para próxima fase", usuarioId);
                return res;
            }
        }

        public async Task TrocarFaseAsync(Guid ordemId, Guid novaFaseId)
        {
            var ordem = await _repository.GetByIdAsync(ordemId);
            if (ordem == null) throw new KeyNotFoundException("Ordem não encontrada.");

            ordem.AvancarFase(novaFaseId);
            ordem.LimparNavegacoes();

            await _repository.UpdateAsync(ordem);
            await _logService.RegistrarAsync("Movimentação Manual", "Produção",
                $"Moveu OP {ordem.CodigoOrdem} manualmente no Kanban");
        }

        public async Task<bool> UpdateAsync(OrdemDeProducaoUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null) throw new KeyNotFoundException("Ordem não encontrada.");

            await ValidarLoteUnicoAsync(dto.LoteId, dto.Id);

            existing.Atualizar(dto.Quantidade, dto.Observacoes, dto.AlmoxarifadoId, dto.Status, dto.LoteId);

            var updated = await _repository.UpdateAsync(existing);
            if (updated)
                await _logService.RegistrarAsync("Edição", "Produção",
                    $"Editou dados da OP {existing.CodigoOrdem}");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var ordem = await _repository.GetByIdAsync(id);
            if (ordem == null) return false;

            if (ordem.Status == StatusOrdemDeProducao.Finalizada)
                throw new InvalidOperationException("Não é possível cancelar uma Ordem de Produção já finalizada.");

            if (ordem.LoteId.HasValue)
            {
                var lote = await _loteRepository.GetByIdAsync(ordem.LoteId.Value);
                if (lote != null && lote.statusLote == StatusLote.EmProducao)
                {
                    lote.DefinirStatusLote(StatusLote.Pendente);
                    lote.DefinirDataConclusao(null);
                    await _loteRepository.UpdateAsync(lote);
                }
            }

            var deleted = await _repository.DeleteAsync(id);

            if (deleted)
                await _logService.RegistrarAsync("Cancelamento", "Produção",
                    $"Cancelou a OP {ordem.CodigoOrdem} e liberou o Lote vinculado.", null);

            return deleted;
        }

        public async Task<OrdemDeProducao?> GetByIdAsync(Guid id) => await _repository.GetByIdAsync(id);
        public async Task<OrdemDeProducao?> GetByCodigoAsync(string codigo) => await _repository.GetByCodigoAsync(codigo);
        public async Task<IEnumerable<OrdemDeProducao>> GetAllAsync() => await _repository.GetAllAsync();
        public async Task<IEnumerable<OrdemDeProducaoReadDto>> GetAllReadDtosAsync() => await _repository.GetAllReadDtosAsync();

        private async Task ValidarLoteUnicoAsync(Guid? loteId, Guid? ignoreId = null)
        {
            if (!loteId.HasValue) return;
            var emUso = await _context.OrdensDeProducao.AnyAsync(o =>
                o.LoteId == loteId && o.Id != ignoreId &&
                o.Status != StatusOrdemDeProducao.Finalizada &&
                o.Status != StatusOrdemDeProducao.Cancelada);
            if (emUso) throw new InvalidOperationException("Lote já está em uso em outra OP.");
        }

        private async Task ConfigurarRoteiroInicialAsync(OrdemDeProducao ordem)
        {
            var roteiros = await _roteiroRepository.GetAllAsync();
            var roteiro = roteiros.FirstOrDefault(r => r.ProdutoId == ordem.ProdutoId && r.Ativo);

            if (roteiro != null && roteiro.Etapas.Any())
            {
                ordem.DefinirRoteiro(roteiro.Id, roteiro.Etapas.OrderBy(e => e.Ordem).First().FaseProducaoId);
            }
            else if (ordem.FaseAtualId == Guid.Empty)
            {
                throw new InvalidOperationException("Produto sem roteiro definido. Selecione a fase manualmente.");
            }
        }
    }
}
