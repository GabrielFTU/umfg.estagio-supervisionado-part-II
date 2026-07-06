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
        private readonly IDepositoRepository _depositoRepository;
        private readonly ILogSistemaService _logService;

        public OrdemDeProducaoService(
            IOrdemDeProducaoRepository repository,
            IProdutoRepository produtoRepository,
            IMovimentacaoRepository movimentacaoRepository,
            IRoteiroProducaoRepository roteiroRepository,
            ILoteRepository loteRepository,
            ApplicationDbContext context,
            IAlmoxarifadoRepository almoxarifadoRepository,
            IDepositoRepository depositoRepository,
            ILogSistemaService logService)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
            _movimentacaoRepository = movimentacaoRepository;
            _roteiroRepository = roteiroRepository;
            _loteRepository = loteRepository;
            _context = context;
            _almoxarifadoRepository = almoxarifadoRepository;
            _depositoRepository = depositoRepository;
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

            await ValidarDepositoAsync(dto.DepositoId, dto.AlmoxarifadoId, produto.ControlarPorLote);

            if (dto.ProdutoVariacaoId.HasValue)
            {
                var variacao = await _context.Set<ProdutoVariacao>().FindAsync(dto.ProdutoVariacaoId.Value);
                if (variacao == null || variacao.ProdutoId != dto.ProdutoId)
                    throw new ArgumentException("Variação não pertence ao produto selecionado.");
            }

            var faseAtualId = dto.FaseAtualId ?? Guid.Empty;
            var ordem = new OrdemDeProducao(dto.Quantidade, dto.ProdutoId, dto.AlmoxarifadoId,
                faseAtualId, dto.TipoOrdemDeProducaoId, dto.LoteId, dto.Observacoes, dto.ProdutoVariacaoId,
                dto.DepositoId);

            var anoAtual = DateTime.UtcNow.Year;
            var sequencial = await _repository.ObterProximoSequencialAsync(anoAtual);
            ordem.DefinirCodigo($"OP-{anoAtual}-{sequencial:D4}");

            var almoxarifadoMP = await GetAlmoxarifadoPrincipalAsync();
            await ValidarLoteUnicoAsync(dto.LoteId);
            await ConfigurarRoteiroInicialAsync(ordem, dto.RoteiroProducaoId);

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
                    $"Início de Produção OP: {novaOrdem.CodigoOrdem}",
                    almoxarifadoMP.Id, null,
                    novaOrdem.AlmoxarifadoId, novaOrdem.DepositoId,
                    usuarioId,
                    ordemDeProducaoId: novaOrdem.Id);
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

                // Produto acabado entra no estoque do almoxarifado/depósito da OP.
                var mov = new Movimentacao(
                    ordem.ProdutoId, ordem.Quantidade,
                    $"Finalização OP: {ordem.CodigoOrdem}",
                    null, null,
                    ordem.AlmoxarifadoId, ordem.DepositoId,
                    usuarioId,
                    ordemDeProducaoId: ordem.Id);
                await _movimentacaoRepository.AddAsync(mov);

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

            // Produto sem roteiro: fase única — avançar conclui diretamente a OP
            if (!ordem.RoteiroProducaoId.HasValue)
            {
                await FinalizarOrdemAsync(ordemId, usuarioId);
                return true;
            }

            var roteiro = await _roteiroRepository.GetByIdAsync(ordem.RoteiroProducaoId.Value);
            if (roteiro == null) throw new InvalidOperationException("Roteiro inválido.");

            var etapas = roteiro.Etapas.OrderBy(e => e.Ordem).ToList();
            var etapaAtual = etapas.FirstOrDefault(e => e.FaseProducaoId == ordem.FaseAtualId);

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

        public async Task EstornarOrdemAsync(Guid ordemId, Guid usuarioId)
        {
            var ordem = await _repository.GetByIdAsync(ordemId);
            if (ordem == null) throw new KeyNotFoundException("Ordem não encontrada.");
            if (ordem.Status != StatusOrdemDeProducao.Finalizada)
                throw new InvalidOperationException("Somente Ordens de Produção finalizadas podem ser estornadas.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Reverte a entrada do produto acabado gerada na finalização.
                var movEstorno = new Movimentacao(
                    ordem.ProdutoId, ordem.Quantidade,
                    $"Estorno de Produção OP: {ordem.CodigoOrdem}",
                    ordem.AlmoxarifadoId, ordem.DepositoId,
                    null, null,
                    usuarioId,
                    ordemDeProducaoId: ordem.Id);
                await _movimentacaoRepository.AddAsync(movEstorno);

                if (ordem.LoteId.HasValue)
                {
                    var lote = await _loteRepository.GetByIdAsync(ordem.LoteId.Value);
                    if (lote != null)
                    {
                        lote.RevertarParaPendente();
                        await _loteRepository.UpdateAsync(lote);
                    }
                }

                ordem.Estornar();
                await _repository.UpdateAsync(ordem);
                await transaction.CommitAsync();

                await _logService.RegistrarAsync("Estorno", "Produção",
                    $"Estornou a produção da OP {ordem.CodigoOrdem}", usuarioId);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task TrocarFaseAsync(Guid ordemId, Guid novaFaseId, string? justificativa = null)
        {
            var ordem = await _repository.GetByIdAsync(ordemId);
            if (ordem == null) throw new KeyNotFoundException("Ordem não encontrada.");

            ordem.AvancarFase(novaFaseId);
            await _repository.UpdateAsync(ordem);

            var detalhe = string.IsNullOrWhiteSpace(justificativa)
                ? $"Moveu OP {ordem.CodigoOrdem} manualmente no Kanban"
                : $"Moveu OP {ordem.CodigoOrdem} manualmente no Kanban. Justificativa: {justificativa}";

            await _logService.RegistrarAsync("Movimentação Manual", "Produção", detalhe);
        }

        public async Task<bool> UpdateAsync(OrdemDeProducaoUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null) throw new KeyNotFoundException("Ordem não encontrada.");

            await ValidarLoteUnicoAsync(dto.LoteId, dto.Id);

            var produto = await _produtoRepository.GetByIdAsync(existing.ProdutoId);
            await ValidarDepositoAsync(dto.DepositoId, dto.AlmoxarifadoId, produto?.ControlarPorLote ?? false);

            existing.Atualizar(dto.Quantidade, dto.Observacoes, dto.AlmoxarifadoId, dto.Status, dto.LoteId, dto.ProdutoVariacaoId, dto.DepositoId);

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
                if (lote != null && lote.Status == StatusLote.EmProducao)
                {
                    lote.RevertarParaPendente();
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
                o.Status != StatusOrdemDeProducao.Cancelada &&
                o.Status != StatusOrdemDeProducao.Estornada);
            if (emUso) throw new InvalidOperationException("Lote já está em uso em outra OP.");
        }

        private async Task ValidarDepositoAsync(Guid? depositoId, Guid almoxarifadoId, bool exigeLote)
        {
            if (exigeLote && depositoId == null)
                throw new ArgumentException("Selecione um depósito para gerar o produto com lote.");

            if (depositoId == null) return;

            var deposito = await _depositoRepository.GetByIdAsync(depositoId.Value);
            if (deposito == null)
                throw new ArgumentException("Depósito não encontrado.");
            if (deposito.AlmoxarifadoId != almoxarifadoId)
                throw new ArgumentException("O depósito selecionado não pertence ao almoxarifado escolhido.");
            if (exigeLote && !deposito.ControlaLote)
                throw new ArgumentException($"O depósito '{deposito.Nome}' não controla lote. Selecione um depósito habilitado para controle de lote.");
        }

        private async Task ConfigurarRoteiroInicialAsync(OrdemDeProducao ordem, Guid? roteiroId = null)
        {
            RoteiroProducao? roteiro = null;

            if (roteiroId.HasValue)
            {
                roteiro = await _roteiroRepository.GetByIdAsync(roteiroId.Value);
                if (roteiro == null || roteiro.ProdutoId != ordem.ProdutoId)
                    throw new ArgumentException("Roteiro não pertence ao produto selecionado.");
            }
            else
            {
                var roteiros = await _roteiroRepository.GetAllAsync();
                roteiro = roteiros.FirstOrDefault(r => r.ProdutoId == ordem.ProdutoId && r.Ativo);
            }

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
