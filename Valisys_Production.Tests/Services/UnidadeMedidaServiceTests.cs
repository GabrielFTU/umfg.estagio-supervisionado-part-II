using Moq;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Tests.Services;

public class UnidadeMedidaServiceTests
{
    private readonly Mock<IUnidadeMedidaRepository> _repoMock;
    private readonly Mock<ILogSistemaService> _logMock;
    private readonly UnidadeMedidaService _service;

    private static UnidadeMedidaCreateDto ValidCreateDto(string nome = "Quilograma", string sigla = "kg") => new()
    {
        Nome           = nome,
        Sigla          = sigla,
        Grandeza       = GrandezaUnidade.Massa,
        FatorConversao = 1m,
        EhUnidadeBase  = true,
    };

    private static UnidadeMedidaUpdateDto ValidUpdateDto(Guid id) => new()
    {
        Id             = id,
        Nome           = "Grama",
        Sigla          = "g",
        Grandeza       = GrandezaUnidade.Massa,
        FatorConversao = 0.001m,
        EhUnidadeBase  = false,
        Ativo          = true,
    };

    private static UnidadeMedida BuildUnidade(string nome = "Quilograma", string sigla = "kg")
        => new(nome, sigla, GrandezaUnidade.Massa, 1m, true);

    public UnidadeMedidaServiceTests()
    {
        _repoMock = new Mock<IUnidadeMedidaRepository>();
        _logMock  = new Mock<ILogSistemaService>();
        _service  = new UnidadeMedidaService(_repoMock.Object, _logMock.Object);
    }

    // ── CreateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidDto_ReturnsUnidade()
    {
        var dto     = ValidCreateDto();
        var created = BuildUnidade();

        _repoMock.Setup(r => r.AddAsync(It.IsAny<UnidadeMedida>())).ReturnsAsync(created);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Quilograma", result.Nome);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<UnidadeMedida>()), Times.Once);
        _logMock.Verify(l => l.RegistrarAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null), Times.Once);
    }

    [Theory]
    [InlineData("", "kg")]
    [InlineData("   ", "kg")]
    [InlineData("Quilograma", "")]
    [InlineData("Quilograma", "   ")]
    public async Task CreateAsync_WithBlankNomeOrSigla_ThrowsArgumentException(string nome, string sigla)
    {
        var dto = ValidCreateDto(nome, sigla);

        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        _repoMock.Verify(r => r.AddAsync(It.IsAny<UnidadeMedida>()), Times.Never);
    }

    // ── GetByIdAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.GetByIdAsync(Guid.Empty));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsUnidade()
    {
        var id      = Guid.NewGuid();
        var unidade = BuildUnidade();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(unidade);

        var result = await _service.GetByIdAsync(id);

        Assert.NotNull(result);
    }

    // ── GetAllAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllUnidades()
    {
        var lista = new List<UnidadeMedida> { BuildUnidade("kg", "kg"), BuildUnidade("g", "g") };

        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    // ── UpdateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_WithValidDto_ReturnsTrue()
    {
        var id      = Guid.NewGuid();
        var dto     = ValidUpdateDto(id);
        var unidade = BuildUnidade();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(unidade);
        _repoMock.Setup(r => r.UpdateAsync(unidade)).ReturnsAsync(true);

        var result = await _service.UpdateAsync(dto);

        Assert.True(result);
        _logMock.Verify(l => l.RegistrarAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithEmptyId_ThrowsArgumentException()
    {
        var dto = ValidUpdateDto(Guid.Empty);

        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateAsync(dto));
    }

    [Fact]
    public async Task UpdateAsync_WhenNotFound_ThrowsKeyNotFoundException()
    {
        var id  = Guid.NewGuid();
        var dto = ValidUpdateDto(id);

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((UnidadeMedida?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(dto));
    }

    // ── DeleteAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WithValidId_DeactivatesUnidade()
    {
        var id      = Guid.NewGuid();
        var unidade = BuildUnidade();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(unidade);
        _repoMock.Setup(r => r.HasActiveProdutosAsync(id)).ReturnsAsync(false);
        _repoMock.Setup(r => r.UpdateAsync(unidade)).ReturnsAsync(true);

        var result = await _service.DeleteAsync(id);

        Assert.True(result);
        Assert.False(unidade.Ativo);
        _logMock.Verify(l => l.RegistrarAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ReturnsFalse()
    {
        var id = Guid.NewGuid();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((UnidadeMedida?)null);

        var result = await _service.DeleteAsync(id);

        Assert.False(result);
    }

    [Fact]
    public async Task DeleteAsync_WithActiveProdutos_ThrowsInvalidOperationException()
    {
        var id      = Guid.NewGuid();
        var unidade = BuildUnidade();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(unidade);
        _repoMock.Setup(r => r.HasActiveProdutosAsync(id)).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));

        Assert.Contains("produtos ativos", ex.Message);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<UnidadeMedida>()), Times.Never);
    }
}
