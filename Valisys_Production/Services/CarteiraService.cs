using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class CarteiraService : ICarteiraService
    {
        private readonly ICarteiraRepository _repository;
        private readonly ILogSistemaService _logService;

        public CarteiraService(ICarteiraRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<Carteira> CreateAsync(CarteiraCreateDto dto)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(dto.CodigoBanco);
            ArgumentException.ThrowIfNullOrWhiteSpace(dto.NomeBanco);
            ArgumentException.ThrowIfNullOrWhiteSpace(dto.Titular);

            var carteira = new Carteira(
                dto.CodigoBanco,
                dto.NomeBanco,
                dto.Titular,
                dto.SaldoInicial,
                dto.DataHoraSaldoInicial);

            var created = await _repository.AddAsync(carteira);

            await _logService.RegistrarAsync("Criação", "Carteiras",
                $"Cadastrou carteira '{created.Titular}' — banco {created.CodigoBanco} - {created.NomeBanco}");

            return created;
        }

        public async Task<Carteira?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Carteira>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<bool> UpdateAsync(CarteiraUpdateDto dto)
        {
            var carteira = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Carteira não encontrada.");

            carteira.Atualizar(dto.CodigoBanco, dto.NomeBanco, dto.Titular,
                dto.SaldoInicial, dto.DataHoraSaldoInicial);

            var ok = await _repository.UpdateAsync(carteira);

            if (ok)
                await _logService.RegistrarAsync("Edição", "Carteiras",
                    $"Editou carteira '{carteira.Titular}' — banco {carteira.CodigoBanco} - {carteira.NomeBanco}");

            return ok;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var carteira = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Carteira não encontrada.");

            var ok = await _repository.DeleteAsync(id);

            if (ok)
                await _logService.RegistrarAsync("Desativação", "Carteiras",
                    $"Desativou carteira '{carteira.Titular}'");

            return ok;
        }

        public async Task<bool> AtivarAsync(Guid id)
        {
            var carteira = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Carteira não encontrada.");

            carteira.Ativar();
            var ok = await _repository.UpdateAsync(carteira);

            if (ok)
                await _logService.RegistrarAsync("Reativação", "Carteiras",
                    $"Reativou carteira '{carteira.Titular}'");

            return ok;
        }
    }
}
