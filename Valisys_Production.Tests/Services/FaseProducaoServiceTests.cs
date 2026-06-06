using Moq;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Tests.Services;

public class FaseProducaoServiceTests
{
    private readonly Mock<IFaseProducaoRepository> _repoMock;
    private readonly Mock<ILogSistemaService> _logMock;
    private readonly FaseProducaoService _service;

    public FaseProducaoServiceTests()
    {
        _repoMock = new Mock<IFaseProducaoRepository>();
        _logMock  = new Mock<ILogSistemaService>();
        _service  = new FaseProducaoService(_repoMock.Object, _logMock.Object);

        _logMock.Setup(l => l.RegistrarAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>()))
            .Returns(Task.CompletedTask);
    }

    // ── CreateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidDto_ReturnsCreatedFase()
    {
        var dto = new FaseProducaoCreateDto { Nome = "Corte", Ordem = 1, TempoPadraoDias = 2 };
        var created = new FaseProducao("Corte", 1, null, 2);

        _repoMock.Setup(r => r.AddAsync(It.IsAny<FaseProducao>())).ReturnsAsync(created);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Corte", result.Nome);
        Assert.Equal(1, result.Ordem);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<FaseProducao>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateAsync_WithBlankNome_ThrowsArgumentException(string nome)
    {
        var dto = new FaseProducaoCreateDto { Nome = nome, Ordem = 1 };

        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        _repoMock.Verify(r => r.AddAsync(It.IsAny<FaseProducao>()), Times.Never);
    }

    // ── GetByIdAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.GetByIdAsync(Guid.Empty));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsFase()
    {
        var id   = Guid.NewGuid();
        var fase = new FaseProducao("Montagem", 2);

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(fase);

        var result = await _service.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal("Montagem", result!.Nome);
    }

    // ── GetAllAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllFases()
    {
        var lista = new List<FaseProducao>
        {
            new("Corte",    1),
            new("Montagem", 2),
            new("Acabamento", 3),
        };
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(3, result.Count());
    }

    // ── UpdateAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_WithValidDto_ReturnsTrue()
    {
        var id   = Guid.NewGuid();
        var fase = new FaseProducao("Corte", 1);
        var dto  = new FaseProducaoUpdateDto { Id = id, Nome = "Corte Atualizado", Ordem = 1, Ativo = true };

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(fase);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<FaseProducao>())).ReturnsAsync(true);

        var result = await _service.UpdateAsync(dto);

        Assert.True(result);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentId_ThrowsKeyNotFoundException()
    {
        var dto = new FaseProducaoUpdateDto { Id = Guid.NewGuid(), Nome = "X", Ordem = 1, Ativo = true };
        _repoMock.Setup(r => r.GetByIdAsync(dto.Id)).ReturnsAsync((FaseProducao?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(dto));
    }

    [Fact]
    public async Task UpdateAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        var dto = new FaseProducaoUpdateDto { Id = Guid.Empty, Nome = "X", Ordem = 1, Ativo = true };

        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateAsync(dto));
    }

    // ── DeleteAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WithActiveDependencias_ThrowsInvalidOperationException()
    {
        var id   = Guid.NewGuid();
        var fase = new FaseProducao("Corte", 1);

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(fase);
        _repoMock.Setup(r => r.HasActiveDependenciasAsync(id)).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));

        Assert.Contains("roteiros de produção ou ordens em andamento", ex.Message);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<FaseProducao>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WithoutDependencias_DesativaERetornaTrue()
    {
        var id   = Guid.NewGuid();
        var fase = new FaseProducao("Corte", 1);

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(fase);
        _repoMock.Setup(r => r.HasActiveDependenciasAsync(id)).ReturnsAsync(false);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<FaseProducao>())).ReturnsAsync(true);

        var result = await _service.DeleteAsync(id);

        Assert.True(result);
        Assert.False(fase.Ativo);
        _logMock.Verify(l => l.RegistrarAsync("Inativação", "Fases de Produção",
            It.IsAny<string>(), It.IsAny<Guid?>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentId_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((FaseProducao?)null);

        var result = await _service.DeleteAsync(id);

        Assert.False(result);
        _repoMock.Verify(r => r.HasActiveDependenciasAsync(It.IsAny<Guid>()), Times.Never);
    }
}
