using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class FichaTecnicaService : IFichaTecnicaService
    {
        private readonly IFichaTecnicaRepository _repository;
        private readonly IProdutoRepository _produtoRepository;
        private readonly ILogSistemaService _logService;

        public FichaTecnicaService(
            IFichaTecnicaRepository repository,
            IProdutoRepository produtoRepository,
            ILogSistemaService logService)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
            _logService = logService;
        }

        private async Task<string> GerarProximoCodigoAsync()
        {
            var ultimoCodigo = await _repository.GetUltimoCodigoAsync();
            int proximoNumero = 1;
            if (!string.IsNullOrEmpty(ultimoCodigo))
            {
                var partes = ultimoCodigo.Split('-');
                if (partes.Length > 1 && int.TryParse(partes[1], out int ultimoNumero))
                    proximoNumero = ultimoNumero + 1;
            }
            return $"FT-{proximoNumero:D4}";
        }

        public async Task<string> ObterProximoCodigoAsync() => await GerarProximoCodigoAsync();

        public async Task<FichaTecnica> CreateAsync(FichaTecnicaCreateDto dto)
        {
            var produtoPai = await _produtoRepository.GetByIdAsync(dto.ProdutoId)
                ?? throw new KeyNotFoundException("Produto pai não encontrado.");

            if (produtoPai.Classificacao != ClassificacaoEnum.Componente &&
                produtoPai.Classificacao != ClassificacaoEnum.ProdutoAcabado)
                throw new InvalidOperationException("Ficha técnica só pode ser criada para produtos classificados como Componente ou Produto Acabado.");

            var ficha = new FichaTecnica(dto.ProdutoId, dto.Versao ?? "1.0", dto.Descricao);
            var codigo = string.IsNullOrEmpty(dto.Codigo) ? await GerarProximoCodigoAsync() : dto.Codigo;
            ficha.DefinirCodigo(codigo);

            if (dto.Itens != null)
            {
                foreach (var itemDto in dto.Itens)
                {
                    var componente = await _produtoRepository.GetByIdAsync(itemDto.ProdutoComponenteId)
                        ?? throw new KeyNotFoundException($"Componente {itemDto.ProdutoComponenteId} não encontrado.");
                    if (!componente.Ativo)
                        throw new InvalidOperationException($"Produto '{componente.Nome}' está INATIVO.");
                    if (itemDto.ProdutoComponenteId == dto.ProdutoId)
                        throw new InvalidOperationException("Referência circular detectada.");

                    ficha.AdicionarItem(new FichaTecnicaItem(
                        itemDto.ProdutoComponenteId,
                        itemDto.Quantidade,
                        itemDto.PerdaPercentual,
                        itemDto.FaseProducaoId,
                        itemDto.CorId,
                        itemDto.Observacao));
                }
            }

            if (dto.Sequencias != null)
            {
                foreach (var seqDto in dto.Sequencias)
                    ficha.AdicionarSequencia(new FichaTecnicaSequencia(
                        seqDto.FaseProducaoId,
                        seqDto.Ordem,
                        seqDto.Descricao,
                        seqDto.Observacao,
                        seqDto.TempoEstimadoDias));
            }

            var created = await _repository.AddAsync(ficha);
            await _logService.RegistrarAsync("Criação", "Engenharia",
                $"Criou Ficha Técnica {created.CodigoFicha} para o produto '{produtoPai.Nome}'");
            return created;
        }

        public async Task<FichaTecnica?> GetByIdAsync(Guid id) => await _repository.GetByIdAsync(id);
        public async Task<IEnumerable<FichaTecnica>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<IEnumerable<FichaTecnica>> GetByProdutoIdAsync(Guid produtoId)
        {
            var todas = await _repository.GetAllAsync();
            return todas.Where(f => f.ProdutoId == produtoId);
        }

        public async Task<IEnumerable<Produto>> GetProdutosSemFichaAsync()
        {
            var todos = await _produtoRepository.GetAllAsync();
            var elegíveis = todos.Where(p =>
                p.Ativo &&
                (p.Classificacao == ClassificacaoEnum.Componente ||
                 p.Classificacao == ClassificacaoEnum.ProdutoAcabado));

            var fichas = await _repository.GetAllAsync();
            var produtosComFicha = fichas.Select(f => f.ProdutoId).ToHashSet();

            return elegíveis.Where(p => !produtosComFicha.Contains(p.Id));
        }

        public async Task<bool> UpdateAsync(FichaTecnicaUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID inválido.");

            var fichaOriginal = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Ficha técnica não encontrada.");

            var novosItens = new List<FichaTecnicaItem>();
            if (dto.Itens != null)
            {
                foreach (var itemDto in dto.Itens)
                {
                    var componente = await _produtoRepository.GetByIdAsync(itemDto.ProdutoComponenteId)
                        ?? throw new KeyNotFoundException($"Componente {itemDto.ProdutoComponenteId} não encontrado.");
                    if (!componente.Ativo)
                        throw new InvalidOperationException($"Produto '{componente.Nome}' está INATIVO.");
                    if (itemDto.ProdutoComponenteId == fichaOriginal.ProdutoId)
                        throw new InvalidOperationException("Referência circular detectada.");

                    novosItens.Add(new FichaTecnicaItem(
                        itemDto.ProdutoComponenteId,
                        itemDto.Quantidade,
                        itemDto.PerdaPercentual,
                        itemDto.FaseProducaoId,
                        itemDto.CorId,
                        itemDto.Observacao));
                }
            }

            var novasSequencias = new List<FichaTecnicaSequencia>();
            if (dto.Sequencias != null)
            {
                foreach (var seqDto in dto.Sequencias)
                    novasSequencias.Add(new FichaTecnicaSequencia(
                        seqDto.FaseProducaoId,
                        seqDto.Ordem,
                        seqDto.Descricao,
                        seqDto.Observacao,
                        seqDto.TempoEstimadoDias));
            }

            fichaOriginal.Atualizar(dto.Codigo, dto.Versao, dto.Descricao, dto.Ativa);
            var updated = await _repository.UpdateWithItemsAsync(fichaOriginal, novosItens, novasSequencias);

            if (updated)
                await _logService.RegistrarAsync("Edição", "Engenharia",
                    $"Editou Ficha Técnica {fichaOriginal.CodigoFicha}");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            var deleted = await _repository.DeleteAsync(id);
            if (deleted)
                await _logService.RegistrarAsync("Exclusão", "Engenharia",
                    $"Inativou/Excluiu Ficha Técnica {existing.CodigoFicha}");
            return deleted;
        }
    }
}
