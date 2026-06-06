using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class CategoriaProdutoService : ICategoriaProdutoService
    {
        private readonly ICategoriaProdutoRepository _repository;
        private readonly ILogSistemaService _logService;

        public CategoriaProdutoService(ICategoriaProdutoRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<CategoriaProduto> CreateAsync(CategoriaProdutoCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome da categoria é obrigatório.");

            var categoria = new CategoriaProduto(dto.Nome, dto.Descricao);
            categoria.DefinirCodigo(await GerarProximoCodigoAsync());

            var created = await _repository.AddAsync(categoria);

            await _logService.RegistrarAsync("Criação", "Categoria de Produto",
                $"Criou a categoria '{created.Nome}' ({created.CodigoInterno})");

            return created;
        }

        public async Task<CategoriaProduto?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<CategoriaProduto>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(CategoriaProdutoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Categoria não encontrada.");

            existing.Atualizar(dto.Nome, dto.Codigo, dto.Ativo);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "Categoria de Produto",
                    $"Editou a categoria '{existing.Nome}'");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            if (await _repository.HasActiveProdutosAsync(id))
                throw new InvalidOperationException(
                    $"A categoria '{existing.Nome}' possui produtos ativos e não pode ser desativada.");

            existing.Desativar();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Inativação", "Categoria de Produto",
                    $"Inativou a categoria '{existing.Nome}'");

            return result;
        }

        private async Task<string> GerarProximoCodigoAsync()
        {
            var categorias = await _repository.GetAllAsync();
            var codigosNumericos = categorias
                .Select(c => c.CodigoInterno)
                .Where(c => int.TryParse(c, out _))
                .Select(c => int.Parse(c!))
                .ToList();

            int proximo = codigosNumericos.Count != 0 ? codigosNumericos.Max() + 1 : 1;
            return proximo.ToString("D3");
        }
    }
}
