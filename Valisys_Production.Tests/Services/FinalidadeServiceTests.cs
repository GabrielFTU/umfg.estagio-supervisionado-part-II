using Moq;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services;

namespace Valisys_Production.Tests.Services;

public class FinalidadeServiceTests
{
    private readonly Mock<IFinalidadeRepository> _repoMock;
    private readonly FinalidadeService _service;

    public FinalidadeServiceTests()
    {
        _repoMock = new Mock<IFinalidadeRepository>();
        _service  = new FinalidadeService(_repoMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WithValidNome_ReturnsCreatedComCodigo()
    {
        var dto = new FinalidadeCreateDto { Nome = "Venda Normal" };

        _repoMock.Setup(r => r.NomeExisteAsync(dto.Nome, null)).ReturnsAsync(false);
        _repoMock.Setup(r => r.GetProximoCodigoAsync()).ReturnsAsync(1);
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Finalidade>())).Returns(Task.CompletedTask);
        _repoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(dto);

        Assert.Equal(1, result.Codigo);
        Assert.Equal("Venda Normal", result.Nome);
    }

    [Fact]
    public async Task CreateAsync_WithNomeDuplicado_ThrowsInvalidOperationException()
    {
        var dto = new FinalidadeCreateDto { Nome = "Demonstração" };
        _repoMock.Setup(r => r.NomeExisteAsync(dto.Nome, null)).ReturnsAsync(true);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Finalidade>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_QuandoProximoCodigoExcede99_ThrowsInvalidOperationException()
    {
        var dto = new FinalidadeCreateDto { Nome = "Centésima Finalidade" };

        _repoMock.Setup(r => r.NomeExisteAsync(dto.Nome, null)).ReturnsAsync(false);
        _repoMock.Setup(r => r.GetProximoCodigoAsync()).ReturnsAsync(100);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));

        Assert.Contains("99", ex.Message);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Finalidade>()), Times.Never);
    }
}
