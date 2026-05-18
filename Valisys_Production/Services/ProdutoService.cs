using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Services
{
    public class ProdutoService : IProdutoService
    {
        private readonly IProdutoRepository _repository;
        private readonly ILogSistemaService _logService;

        public ProdutoService(IProdutoRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<Produto> CreateAsync(ProdutoCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Nome))
                throw new ArgumentException("O nome do produto não pode ser vazio.");

            var produto = new Produto(dto.Nome, dto.Descricao, dto.Classificacao,
                dto.ControlarPorLote, dto.UnidadeMedidaId, dto.CategoriaProdutoId, dto.Observacoes);
            produto.DefinirCodigo(await GerarProximoCodigoSequencialAsync());

            var criado = await _repository.AddAsync(produto);

            await _logService.RegistrarAsync("Criação", "Produtos",
                $"Criou o produto '{criado.Nome}' (Cód: {criado.CodigoInternoProduto})");

            return criado;
        }

        private async Task<string> GerarProximoCodigoSequencialAsync()
        {
            var produtos = await _repository.GetAllAsync();
            var codigosNumericos = produtos
                .Select(p => p.CodigoInternoProduto)
                .Where(c => int.TryParse(c, out _))
                .Select(c => int.Parse(c))
                .ToList();

            int proximoNumero = codigosNumericos.Any() ? codigosNumericos.Max() + 1 : 1;
            return proximoNumero.ToString("D4");
        }

        public async Task<Produto?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Produto>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(ProdutoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null) throw new KeyNotFoundException("Produto não encontrado.");

            existing.Atualizar(dto.Nome, dto.Descricao, dto.Classificacao, dto.ControlarPorLote,
                dto.EstoqueMinimo, dto.UnidadeMedidaId, dto.CategoriaProdutoId, dto.Observacoes, dto.Ativo);

            var updated = await _repository.UpdateAsync(existing);

            if (updated)
                await _logService.RegistrarAsync("Edição", "Produtos",
                    $"Editou o produto '{existing.Nome}' (ID: {existing.Id})");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            var deleted = await _repository.DeleteAsync(id);

            if (deleted)
                await _logService.RegistrarAsync("Exclusão", "Produtos",
                    $"Inativou/Excluiu o produto '{existing.Nome}'");

            return deleted;
        }
    }
}
