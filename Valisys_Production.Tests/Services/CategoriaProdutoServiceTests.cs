using Moq;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Tests.Services;

public class CategoriaProdutoServiceTests
{
    private readonly Mock<ICategoriaProdutoRepository> _repoMock;
    private readonly Mock<ILogSistemaService> _logMock;
    private readonly CategoriaProdutoService _service;

    public CategoriaProdutoServiceTests()
    {
        _repoMock = new Mock<ICategoriaProdutoRepository>();
        _logMock  = new Mock<ILogSistemaService>();
        _service  = new CategoriaProdutoService(_repoMock.Object, _logMock.Object);

        _logMock.Setup(l => l.RegistrarAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>()))
            .Returns(Task.CompletedTask);
    }

    // ── CreateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidNome_ReturnsCreatedCategoria()
    {
        var dto = new CategoriaProdutoCreateDto { Nome = "Eletrônicos" };
        var created = new CategoriaProduto("Eletrônicos");

        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<CategoriaProduto>());
        _repoMock.Setup(r => r.AddAsync(It.IsAny<CategoriaProduto>())).ReturnsAsync(created);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Eletrônicos", result.Nome);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<CategoriaProduto>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateAsync_WithBlankNome_ThrowsArgumentException(string nome)
    {
        var dto = new CategoriaProdutoCreateDto { Nome = nome };

        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        _repoMock.Verify(r => r.AddAsync(It.IsAny<CategoriaProduto>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_GeneratesSequentialCode_WhenCategoriesExist()
    {
        var existente = new CategoriaProduto("Outros");
        existente.DefinirCodigo("003");

        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<CategoriaProduto> { existente });
        _repoMock.Setup(r => r.AddAsync(It.IsAny<CategoriaProduto>()))
            .ReturnsAsync((CategoriaProduto c) => c);

        await _service.CreateAsync(new CategoriaProdutoCreateDto { Nome = "Nova" });

        _repoMock.Verify(r => r.AddAsync(It.Is<CategoriaProduto>(c => c.CodigoInterno == "004")), Times.Once);
    }

    // ── GetByIdAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.GetByIdAsync(Guid.Empty));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsCategoria()
    {
        var id       = Guid.NewGuid();
        var categoria = new CategoriaProduto("Ferramentas");

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(categoria);

        var result = await _service.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal("Ferramentas", result!.Nome);
    }

    // ── GetAllAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsList()
    {
        var lista = new List<CategoriaProduto> { new("A"), new("B"), new("C") };
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(3, result.Count());
    }

    // ── UpdateAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_WithValidDto_ReturnsTrue()
    {
        var id       = Guid.NewGuid();
        var categoria = new CategoriaProduto("Velha");
        var dto = new CategoriaProdutoUpdateDto { Id = id, Nome = "Nova", Codigo = "001", Ativo = true };

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(categoria);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<CategoriaProduto>())).ReturnsAsync(true);

        var result = await _service.UpdateAsync(dto);

        Assert.True(result);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentId_ThrowsKeyNotFoundException()
    {
        var dto = new CategoriaProdutoUpdateDto { Id = Guid.NewGuid(), Nome = "X", Codigo = "001", Ativo = true };
        _repoMock.Setup(r => r.GetByIdAsync(dto.Id)).ReturnsAsync((CategoriaProduto?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(dto));
    }

    [Fact]
    public async Task UpdateAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        var dto = new CategoriaProdutoUpdateDto { Id = Guid.Empty, Nome = "X", Codigo = "001", Ativo = true };

        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateAsync(dto));
    }

    // ── DeleteAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WithActiveProdutos_ThrowsInvalidOperationException()
    {
        var id       = Guid.NewGuid();
        var categoria = new CategoriaProduto("Com Produtos");

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(categoria);
        _repoMock.Setup(r => r.HasActiveProdutosAsync(id)).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));

        Assert.Contains("produtos ativos", ex.Message);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<CategoriaProduto>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WithoutActiveProdutos_DesativaERetornaTrue()
    {
        var id       = Guid.NewGuid();
        var categoria = new CategoriaProduto("Sem Produtos");

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(categoria);
        _repoMock.Setup(r => r.HasActiveProdutosAsync(id)).ReturnsAsync(false);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<CategoriaProduto>())).ReturnsAsync(true);

        var result = await _service.DeleteAsync(id);

        Assert.True(result);
        Assert.False(categoria.Ativo);
        _logMock.Verify(l => l.RegistrarAsync("Inativação", "Categoria de Produto",
            It.IsAny<string>(), It.IsAny<Guid?>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentId_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((CategoriaProduto?)null);

        var result = await _service.DeleteAsync(id);

        Assert.False(result);
        _repoMock.Verify(r => r.HasActiveProdutosAsync(It.IsAny<Guid>()), Times.Never);
    }
}
