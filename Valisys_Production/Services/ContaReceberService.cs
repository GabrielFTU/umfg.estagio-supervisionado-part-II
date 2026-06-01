using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class ContaReceberService : IContaReceberService
    {
        private readonly IContaReceberRepository _repository;
        private readonly ILogSistemaService _logService;

        public ContaReceberService(IContaReceberRepository repository, ILogSistemaService logService)
        {
            _repository = repository;
            _logService = logService;
        }

        public async Task<ContaReceber> CreateAsync(ContaReceberCreateDto dto)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(dto.Descricao);

            if (dto.ValorTotal <= 0)
                throw new ArgumentException("O valor total deve ser maior que zero.");

            var conta = new ContaReceber(dto.Descricao, dto.ValorTotal, dto.DataVencimento,
                dto.Observacoes, dto.PessoaId, dto.PedidoVendaId);

            var nParcelas = Math.Max(1, dto.NumeroParcelas);
            var valorParcela = Math.Round(dto.ValorTotal / nParcelas, 2);

            for (int i = 1; i <= nParcelas; i++)
            {
                var vencimentoParcela = dto.DataVencimento.AddMonths(i - 1);
                var valor = i == nParcelas
                    ? dto.ValorTotal - valorParcela * (nParcelas - 1)
                    : valorParcela;

                conta.AdicionarParcela(new ParcelaReceber(i, valor, vencimentoParcela));
            }

            var created = await _repository.AddAsync(conta);

            var sequencial = await _repository.ContarAsync();
            created.DefinirCodigo($"CR-{DateTime.UtcNow.Year}-{sequencial:D4}");
            await _repository.UpdateAsync(created);

            await _logService.RegistrarAsync("Criação", "ContasReceber",
                $"Cadastrou conta a receber '{created.Descricao}' ({nParcelas}x) no valor de {created.ValorTotal:N2}");

            return created;
        }

        public async Task<ContaReceber?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("ID inválido.");
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<ContaReceber>> GetAllAsync()
            => await _repository.GetAllAsync();

        public async Task<IEnumerable<ContaReceber>> GetByPeriodoAsync(DateTime inicio, DateTime fim)
            => await _repository.GetByPeriodoAsync(inicio, fim);

        public async Task<bool> UpdateAsync(ContaReceberUpdateDto dto)
        {
            if (dto.Id == Guid.Empty) throw new ArgumentException("ID ausente.");

            var existing = await _repository.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Conta a receber não encontrada.");

            existing.Atualizar(dto.Descricao, dto.DataVencimento, dto.Observacoes);

            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Edição", "ContasReceber",
                    $"Atualizou conta a receber '{existing.Descricao}'");

            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing is null) return false;

            existing.Desativar();
            var result = await _repository.UpdateAsync(existing);

            if (result)
                await _logService.RegistrarAsync("Cancelamento", "ContasReceber",
                    $"Cancelou conta a receber '{existing.Descricao}'");

            return result;
        }

        public async Task<bool> BaixarParcelaAsync(ParcelaBaixaDto dto)
        {
            if (dto.ValorPago <= 0)
                throw new ArgumentException("O valor pago deve ser maior que zero.");

            var result = await _repository.BaixarParcelaAsync(
                dto.ContaId, dto.ParcelaId, dto.ValorPago, dto.DataPagamento,
                (FormaPagamentoEnum)dto.FormaPagamento, dto.Juros, dto.Multa, dto.Observacoes);

            if (result)
                await _logService.RegistrarAsync("Baixa", "ContasReceber",
                    $"Baixou parcela da conta {dto.ContaId} no valor de {dto.ValorPago:N2}");

            return result;
        }

        public async Task VerificarVencimentosAsync()
        {
            await _repository.VerificarVencimentosAsync();
            await _logService.RegistrarAsync("Verificação", "ContasReceber",
                "Verificação de vencimentos de contas a receber executada.");
        }
    }
}
