using Moq;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;

namespace Valisys_Production.Tests.Services;

public class AlmoxarifadoServiceTests
{
    private readonly Mock<IAlmoxarifadoRepository> _repoMock;
    private readonly AlmoxarifadoService _service;

    private static AlmoxarifadoCreateDto ValidCreateDto(string nome = "Almoxarifado Central") => new()
    {
        Nome        = nome,
        Descricao   = "Armazém principal",
        Localizacao = "Galpão A",
        Responsavel = "João Silva",
    };

    private static AlmoxarifadoUpdateDto ValidUpdateDto(Guid id) => new()
    {
        Id          = id,
        Nome        = "Almoxarifado Central",
        Descricao   = "Armazém principal atualizado",
        Localizacao = "Galpão A",
        Responsavel = "Maria Souza",
        Ativo       = true,
    };

    public AlmoxarifadoServiceTests()
    {
        _repoMock = new Mock<IAlmoxarifadoRepository>();
        _service  = new AlmoxarifadoService(_repoMock.Object);
    }

    // ── CreateAsync ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidDto_ReturnsAlmoxarifado()
    {
        var dto     = ValidCreateDto();
        var created = new Almoxarifado(dto.Nome, dto.Descricao, dto.Localizacao, dto.Responsavel);

        _repoMock.Setup(r => r.AddAsync(It.IsAny<Almoxarifado>())).ReturnsAsync(created);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Almoxarifado Central", result.Nome);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Almoxarifado>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateAsync_WithBlankNome_ThrowsArgumentException(string nome)
    {
        var dto = ValidCreateDto(nome);

        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Almoxarifado>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_PersistsContatoAndEmail()
    {
        var dto = ValidCreateDto();
        dto.Contato = "11999990000";
        dto.Email   = "almox@empresa.com";

        _repoMock.Setup(r => r.AddAsync(It.IsAny<Almoxarifado>()))
            .ReturnsAsync((Almoxarifado a) => a);

        var result = await _service.CreateAsync(dto);

        Assert.Equal("11999990000",      result.Contato);
        Assert.Equal("almox@empresa.com", result.Email);
    }

    // ── GetByIdAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.GetByIdAsync(Guid.Empty));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsAlmoxarifado()
    {
        var id   = Guid.NewGuid();
        var almo = new Almoxarifado("Galpão Norte", null, "Zona Industrial", "Ana Lima");

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(almo);

        var result = await _service.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal("Galpão Norte", result!.Nome);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentId_ReturnsNull()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Almoxarifado?)null);

        var result = await _service.GetByIdAsync(id);

        Assert.Null(result);
    }

    // ── GetAllAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllAlmoxarifados()
    {
        var lista = new List<Almoxarifado>
        {
            new("Central", null, "Galpão A", "João"),
            new("Norte",   null, "Galpão B", "Maria"),
        };
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    // ── UpdateAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_WithValidDto_ReturnsTrue()
    {
        var id   = Guid.NewGuid();
        var almo = new Almoxarifado("Antigo", null, "Local A", "Resp A");
        var dto  = ValidUpdateDto(id);

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(almo);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Almoxarifado>())).ReturnsAsync(true);

        var result = await _service.UpdateAsync(dto);

        Assert.True(result);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentId_ThrowsKeyNotFoundException()
    {
        var dto = ValidUpdateDto(Guid.NewGuid());
        _repoMock.Setup(r => r.GetByIdAsync(dto.Id)).ReturnsAsync((Almoxarifado?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(dto));
    }

    [Fact]
    public async Task UpdateAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        var dto = ValidUpdateDto(Guid.Empty);

        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateAsync(dto));
    }

    [Fact]
    public async Task UpdateAsync_WithBlankNome_ThrowsArgumentException()
    {
        var dto = ValidUpdateDto(Guid.NewGuid());
        dto.Nome = "   ";

        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateAsync(dto));
    }

    // ── DeleteAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WithEmptyGuid_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteAsync(Guid.Empty));
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistentId_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Almoxarifado?)null);

        var result = await _service.DeleteAsync(id);

        Assert.False(result);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Almoxarifado>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WithoutActiveDepositos_DesativaERetornaTrue()
    {
        var id   = Guid.NewGuid();
        var almo = new Almoxarifado("Vazio", null, "Local", "Resp");

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(almo);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Almoxarifado>())).ReturnsAsync(true);

        var result = await _service.DeleteAsync(id);

        Assert.True(result);
        Assert.False(almo.Ativo);
    }

    [Fact]
    public async Task DeleteAsync_WithActiveDepositos_ThrowsInvalidOperationException()
    {
        var id   = Guid.NewGuid();
        var almo = new Almoxarifado("Com Depósito", null, "Local", "Resp");
        almo.AdicionarDeposito(id, 1, "Depósito A");

        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(almo);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(id));

        Assert.Contains("depósitos ativos", ex.Message);
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Almoxarifado>()), Times.Never);
    }
}
