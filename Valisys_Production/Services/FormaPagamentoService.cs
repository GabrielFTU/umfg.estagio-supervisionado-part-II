using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class FormaPagamentoService : IFormaPagamentoService
    {
        private readonly IFormaPagamentoRepository _repository;
        private readonly ILogSistemaService _log;

        public FormaPagamentoService(IFormaPagamentoRepository repository, ILogSistemaService log)
        {
            _repository = repository;
            _log = log;
        }

        public async Task<FormaPagamento> CreateAsync(FormaPagamentoCreateDto dto)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(dto.Nome);

            var codigo = await _repository.GetProximoCodigoAsync();

            var forma = new FormaPagamento(codigo, dto.Nome.Trim(), dto.Descricao?.Trim());
            var criada = await _repository.AddAsync(forma);

            await _log.RegistrarAsync("Criação", "FormasPagamento",
                $"Criou a forma de pagamento '{criada.Nome}' (Cód: {criada.Codigo:D3})");

            return criada;
        }

        public async Task<FormaPagamento?> GetByIdAsync(Guid id)
            => await _repository.GetByIdWithVendedoresAsync(id);

        public async Task<IEnumerable<FormaPagamento>> GetAllAsync()
            => await _repository.GetAllWithVendedoresAsync();

        public async Task<bool> UpdateAsync(FormaPagamentoUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdWithVendedoresAsync(dto.Id)
                ?? throw new KeyNotFoundException("Forma de pagamento não encontrada.");

            existing.Atualizar(dto.Nome.Trim(), dto.Descricao?.Trim(), dto.Ativo);

            var ok = await _repository.UpdateAsync(existing);

            if (ok)
                await _log.RegistrarAsync("Edição", "FormasPagamento",
                    $"Editou a forma de pagamento '{existing.Nome}'");

            return ok;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var ok = await _repository.DeleteAsync(id);

            if (ok)
                await _log.RegistrarAsync("Inativação", "FormasPagamento",
                    $"Inativou a forma de pagamento ID '{id}'");

            return ok;
        }

        public async Task<bool> AdicionarVendedorAsync(Guid formaPagamentoId, Guid vendedorId)
        {
            var forma = await _repository.GetByIdAsync(formaPagamentoId)
                ?? throw new KeyNotFoundException("Forma de pagamento não encontrada.");

            if (!await _repository.VendedorJaVinculadoAsync(formaPagamentoId, vendedorId))
            {
                await _repository.AdicionarVendedorAsync(new FormaPagamentoVendedor(formaPagamentoId, vendedorId));

                await _log.RegistrarAsync("Vínculo", "FormasPagamento",
                    $"Vinculou vendedor '{vendedorId}' à forma '{forma.Nome}'");
            }

            return true;
        }

        public async Task<bool> RemoverVendedorAsync(Guid formaPagamentoId, Guid vendedorId)
        {
            var forma = await _repository.GetByIdAsync(formaPagamentoId)
                ?? throw new KeyNotFoundException("Forma de pagamento não encontrada.");

            var ok = await _repository.RemoverVendedorAsync(formaPagamentoId, vendedorId);

            if (ok)
                await _log.RegistrarAsync("Desvinculo", "FormasPagamento",
                    $"Desvinculou vendedor '{vendedorId}' da forma '{forma.Nome}'");

            return ok;
        }
    }
}
