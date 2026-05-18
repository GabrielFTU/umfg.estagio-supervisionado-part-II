using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class SolicitacaoProducaoService : ISolicitacaoProducaoService
    {
        private readonly ISolicitacaoProducaoRepository _repository;
        private readonly IProdutoRepository _produtoRepository;
        private readonly IOrdemDeProducaoService _ordemDeProducaoService;

        public SolicitacaoProducaoService(
            ISolicitacaoProducaoRepository repository,
            IProdutoRepository produtoRepository,
            IOrdemDeProducaoService ordemDeProducaoService)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
            _ordemDeProducaoService = ordemDeProducaoService;
        }

        public async Task<SolicitacaoProducao> CreateAsync(SolicitacaoProducaoCreateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var produto = await _produtoRepository.GetByIdAsync(dto.ProdutoId);
            if (produto == null) throw new KeyNotFoundException($"Produto com ID {dto.ProdutoId} não encontrado.");

            var solicitacao = new SolicitacaoProducao(dto.Codigo, dto.ProdutoId, (int)dto.QuantidadeSolicitada);
            return await _repository.AddAsync(solicitacao);
        }

        public async Task<SolicitacaoProducao?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID da Solicitação inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<SolicitacaoProducao>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(SolicitacaoProducaoUpdateDto dto)
        {
            if (dto == null || dto.Id == Guid.Empty)
                throw new ArgumentException("Dados da Solicitação inválidos ou ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null)
                throw new KeyNotFoundException($"Solicitação com ID {dto.Id} não encontrada.");

            if (existing.Status != StatusSolicitacaoProducao.Pendente &&
                existing.Status != StatusSolicitacaoProducao.EmProducao)
                throw new InvalidOperationException($"A solicitação não pode ser alterada no status '{existing.Status}'.");

            existing.Atualizar(dto.Codigo, (int)dto.QuantidadeSolicitada,
                dto.ProdutoId, existing.TipoOrdemDeProducaoId, null);

            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID da Solicitação inválido.");

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            if (existing.Status == StatusSolicitacaoProducao.Aprovada ||
                existing.Status == StatusSolicitacaoProducao.EmProducao)
                throw new InvalidOperationException("Solicitações aprovadas ou em produção não podem ser excluídas.");

            return await _repository.DeleteAsync(id);
        }

        public async Task<List<OrdemDeProducao>> AprovarSolicitacaoAsync(Guid solicitacaoId, Guid usuarioAprovadorId)
        {
            if (usuarioAprovadorId == Guid.Empty)
                throw new ArgumentException("ID do usuário aprovador inválido.");

            var solicitacao = await _repository.GetByIdAsync(solicitacaoId);
            if (solicitacao == null) throw new KeyNotFoundException("Solicitação de produção não encontrada.");

            if (solicitacao.Status != StatusSolicitacaoProducao.Pendente)
                throw new InvalidOperationException($"Somente solicitações pendentes podem ser aprovadas. Status atual: {solicitacao.Status}.");

            solicitacao.Aprovar(usuarioAprovadorId);

            if (!await _repository.UpdateAsync(solicitacao))
                throw new InvalidOperationException("Falha ao atualizar o status da solicitação.");

            var ordensGeradas = new List<OrdemDeProducao>();
            foreach (var item in solicitacao.Itens)
            {
                var dto = new OrdemDeProducaoCreateDto
                {
                    ProdutoId = item.ProdutoId,
                    Quantidade = item.Quantidade,
                    TipoOrdemDeProducaoId = solicitacao.TipoOrdemDeProducaoId ?? Guid.Empty,
                    AlmoxarifadoId = Guid.Empty,
                    FaseAtualId = null
                };

                var ordem = await _ordemDeProducaoService.CreateAsync(dto, usuarioAprovadorId);
                ordensGeradas.Add(ordem);
            }

            return ordensGeradas;
        }
    }
}
