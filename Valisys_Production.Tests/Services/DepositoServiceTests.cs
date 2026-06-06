using Moq;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;

namespace Valisys_Production.Tests.Services;

public class DepositoServiceTests
{
    private readonly Mock<IDepositoRepository> _repoMock;
    private readonly DepositoService _service;

    private static readonly Guid _almoxId = Guid.NewGuid();

    private static DepositoCreateDto ValidCreateDto(string nome = "Setor A") => new()
    {
        AlmoxarifadoId     = _almoxId,
        CodigoIdentificador = 1,
        Nome               = nome,
        Descricao          = "Depósito principal",
    };

    private static DepositoUpdateDto ValidUpdateDto(Guid id) => new()
    {
        Id                 = id,
        AlmoxarifadoId     = _almoxId,
        CodigoIdentificador = 1,
        Nome               = "Setor A Atualizado",
        Descricao          = "Descrição atualizada",
        Ativo              = true,
    };

    private static Deposito BuildDeposito(string nome = "Setor A")
        => new(_almoxId, 1, nome, "Depósito principal");

    public DepositoServiceTests()
    {
        _repoMock = new Mock<IDepositoRepository>();
        _service  = new DepositoService(_repoMock.Object);
    }

    // ── CreateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidDto_ReturnsDeposito()
    {
        var dto     = ValidCreateDto();
        var created = BuildDeposito();

        _repoMock.Setup(r => r.AddAsync(It.IsAny<Deposito>())).ReturnsAsync(created);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Setor A", result.Nome);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Deposito>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateAsync_WithBlankNome_ThrowsArgumentException(string nome)
    {
        var dto = ValidCreateDto(nome);

        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Deposito>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_WithEmptyAlmoxarifadoId_ThrowsArgumentException()
    {
        var dto = ValidCreateDto();
        dto.AlmoxarifadoId = Guid.Empty;

        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
    }

    // ── GetByIdAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.GetByIdAsync(Guid.Empty));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsDeposito()
    {
        var id       = Guid.NewGuid();
        var deposito = BuildDeposito();

        _repoMock.Setup(r => r.GetByIdWithAlmoxarifadoAsync(id)).ReturnsAsync(deposito);

        var result = await _service.GetByIdAsync(id);

        Assert.NotNull(result);
        _repoMock.Verify(r => r.GetByIdWithAlmoxarifadoAsync(id), Times.Once);
    }

    // ── GetAllAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllDepositos()
    {
        var depositos = new List<Deposito> { BuildDeposito("Setor A"), BuildDeposito("Setor B") };

        _repoMock.Setup(r => r.GetAllWithAlmoxarifadoAsync()).ReturnsAsync(depositos);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    // ── UpdateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_WithValidDto_ReturnsTrue()
    {
        var id       = Guid.NewGuid();
        var dto      = ValidUpdateDto(id);
        var existing = BuildDeposito();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.UpdateAsync(existing)).ReturnsAsync(true);

        var result = await _service.UpdateAsync(dto);

        Assert.True(result);
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

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Deposito?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(dto));
    }

    [Fact]
    public async Task UpdateAsync_DeactivatingWithActiveLotes_ThrowsInvalidOperationException()
    {
        var id       = Guid.NewGuid();
        var existing = BuildDeposito();
        var dto      = new DepositoUpdateDto
        {
            Id                  = id,
            AlmoxarifadoId      = _almoxId,
            CodigoIdentificador = 1,
            Nome                = "Setor A Atualizado",
            Descricao           = "Descrição atualizada",
            Ativo               = false,
        };

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.HasActiveLotesInAlmoxarifadoAsync(_almoxId)).ReturnsAsync(true);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(dto));
    }

    // ── DeleteAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WithValidId_DeactivatesDeposito()
    {
        var id       = Guid.NewGuid();
        var existing = BuildDeposito();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.HasActiveLotesInAlmoxarifadoAsync(_almoxId)).ReturnsAsync(false);
        _repoMock.Setup(r => r.UpdateAsync(existing)).ReturnsAsync(true);

        var result = await _service.DeleteAsync(id);

        Assert.True(result);
        Assert.False(existing.Ativo);
    }

    [Fact]
    public async Task DeleteAsync_WithEmptyId_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteAsync(Guid.Empty));
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ReturnsFalse()
    {
        var id = Guid.NewGuid();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Deposito?)null);

        var result = await _service.DeleteAsync(id);

        Assert.False(result);
    }

    [Fact]
    public async Task DeleteAsync_WithActiveLotesInAlmoxarifado_ThrowsInvalidOperationException()
    {
        var id       = Guid.NewGuid();
        var existing = BuildDeposito();

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
        _repoMock.Setup(r => r.HasActiveLotesInAlmoxarifadoAsync(_almoxId)).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));

        Assert.Contains("lotes ativos", ex.Message);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Deposito>()), Times.Never);
    }
}
