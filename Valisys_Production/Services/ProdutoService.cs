using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Services.Interfaces;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Services
{
    public class ProdutoService : IProdutoService
    {
        private readonly IProdutoRepository _repository;
        private readonly ICategoriaProdutoRepository _categoriaRepository;
        private readonly ILogSistemaService _logService;

        public ProdutoService(IProdutoRepository repository, ICategoriaProdutoRepository categoriaRepository, ILogSistemaService logService)
        {
            _repository = repository;
            _categoriaRepository = categoriaRepository;
            _logService = logService;
        }

        public async Task<Produto> CreateAsync(ProdutoCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                throw new ArgumentException("O nome do produto não pode ser vazio.");

            var produto = new Produto(
                dto.Nome, dto.Descricao, dto.Classificacao,
                dto.ControlarPorLote, dto.UnidadeMedidaId, dto.CategoriaProdutoId,
                dto.Observacoes, dto.ImagemUrl);

            produto.DefinirCodigo(await GerarProximoCodigoSequencialAsync());
            produto.DefinirSku(await GerarSkuAsync(dto.CategoriaProdutoId));

            // campos fiscais e custos exigem Atualizar; ativo=true por padrão no create
            produto.Atualizar(
                dto.Nome, dto.Descricao, dto.Classificacao, dto.ControlarPorLote, 0,
                dto.UnidadeMedidaId, dto.CategoriaProdutoId, dto.Observacoes, true, dto.ImagemUrl,
                dto.Ncm, dto.TipoItem, dto.OrigemMercadoria,
                dto.CustoPadrao, dto.CustoUltimaCompra, dto.DataUltimaCompra);

            var criado = await _repository.AddAsync(produto);

            await _logService.RegistrarAsync("Criação", "Produtos",
                $"Criou o produto '{criado.Nome}' (Cód: {criado.CodigoInternoProduto})");

            return criado;
        }

        public async Task<Produto?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Produto>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(ProdutoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Produto não encontrado.");

            existing.Atualizar(
                dto.Nome, dto.Descricao, dto.Classificacao, dto.ControlarPorLote,
                dto.EstoqueMinimo, dto.UnidadeMedidaId, dto.CategoriaProdutoId,
                dto.Observacoes, dto.Ativo, dto.ImagemUrl,
                dto.Ncm, dto.TipoItem, dto.OrigemMercadoria,
                dto.CustoPadrao, dto.CustoUltimaCompra, dto.DataUltimaCompra);

            var updated = await _repository.UpdateAsync(existing);

            if (updated)
                await _logService.RegistrarAsync("Edição", "Produtos",
                    $"Editou o produto '{existing.Nome}'");

            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Desativar();
            var deleted = await _repository.UpdateAsync(existing);

            if (deleted)
                await _logService.RegistrarAsync("Inativação", "Produtos",
                    $"Inativou o produto '{existing.Nome}'");

            return deleted;
        }

        public async Task<bool?> ToggleDisponivelParaVendaAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.ToggleDisponivelParaVenda();
            var updated = await _repository.UpdateAsync(existing);

            if (updated)
                await _logService.RegistrarAsync("Atualização", "Produtos",
                    $"Alterou disponibilidade para venda do produto '{existing.Nome}' para {(existing.DisponivelParaVenda ? "disponível" : "indisponível")}");

            return updated ? existing.DisponivelParaVenda : null;
        }

        private async Task<int> GerarProximoCodigoSequencialAsync()
        {
            var ultimo = await _repository.GetUltimoCodigoAsync();
            return (ultimo ?? 0) + 1;
        }

        private async Task<string> GerarSkuAsync(Guid categoriaProdutoId)
        {
            var categoria = await _categoriaRepository.GetByIdAsync(categoriaProdutoId)
                ?? throw new KeyNotFoundException("Categoria não encontrada.");

            var sequencial = await _repository.ContarProdutosPorCategoriaAsync(categoriaProdutoId) + 1;
            var prefixo = string.IsNullOrWhiteSpace(categoria.CodigoInterno) ? "000" : categoria.CodigoInterno;

            return $"{prefixo}-{sequencial:D4}";
        }
    }
}
