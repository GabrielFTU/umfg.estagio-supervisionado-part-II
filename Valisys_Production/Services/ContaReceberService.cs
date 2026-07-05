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
        private readonly ICondicaoPagamentoRepository _condicaoPagamentoRepository;
        private readonly ILogSistemaService _logService;

        public ContaReceberService(IContaReceberRepository repository,
            ICondicaoPagamentoRepository condicaoPagamentoRepository, ILogSistemaService logService)
        {
            _repository = repository;
            _condicaoPagamentoRepository = condicaoPagamentoRepository;
            _logService = logService;
        }

        public async Task<ContaReceber> CreateAsync(ContaReceberCreateDto dto)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(dto.Descricao);

            if (dto.ValorTotal <= 0)
                throw new ArgumentException("O valor total deve ser maior que zero.");

            var condicao = await _condicaoPagamentoRepository.GetByIdAsync(dto.CondicaoPagamentoId)
                ?? throw new ArgumentException("Condição de pagamento não encontrada.");

            if (!condicao.Parcelas.Any())
                throw new ArgumentException("A condição de pagamento selecionada não possui parcelas configuradas.");

            var conta = new ContaReceber(dto.Descricao, dto.ValorTotal, dto.DataVencimento,
                dto.Observacoes, dto.PessoaId, dto.PedidoVendaId, dto.FormaPagamentoId);

            var codigo = await _repository.ProximoCodigoAsync();
            conta.DefinirCodigo(codigo);

            var parcelasCondicao = condicao.Parcelas.OrderBy(p => p.Numero).ToList();
            var valorAcumulado = 0m;

            for (int i = 0; i < parcelasCondicao.Count; i++)
            {
                var pc = parcelasCondicao[i];
                var isUltima = i == parcelasCondicao.Count - 1;
                var valor = isUltima
                    ? dto.ValorTotal - valorAcumulado
                    : Math.Round(dto.ValorTotal * pc.Percentual / 100m, 2);
                valorAcumulado += valor;

                var vencimentoParcela = condicao.CalcularVencimentoParcela(dto.DataVencimento, pc.NumeroDias);
                var parcela = new ParcelaReceber(pc.Numero, valor, vencimentoParcela);
                parcela.DefinirCodigo($"{codigo}/{pc.Numero}");
                conta.AdicionarParcela(parcela);
            }

            var created = await _repository.AddAsync(conta);

            await _logService.RegistrarAsync("Criação", "ContasReceber",
                $"Cadastrou conta a receber '{created.Descricao}' ({parcelasCondicao.Count}x) no valor de {created.ValorTotal:N2}");

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

            if (dto.CarteiraId == Guid.Empty)
                throw new ArgumentException("Selecione a carteira financeira.");

            var result = await _repository.BaixarParcelaAsync(
                dto.ContaId, dto.ParcelaId, dto.ValorPago, dto.DataPagamento,
                (FormaPagamentoEnum)dto.FormaPagamento, dto.CarteiraId, dto.Juros, dto.Multa, dto.Observacoes);

            if (result)
                await _logService.RegistrarAsync("Baixa", "ContasReceber",
                    $"Baixou parcela da conta {dto.ContaId} no valor de {dto.ValorPago:N2}");

            return result;
        }

        public async Task<bool> EstornarParcelaAsync(ParcelaEstornoDto dto)
        {
            var result = await _repository.EstornarParcelaAsync(dto.ContaId, dto.ParcelaId);

            if (result)
                await _logService.RegistrarAsync("Estorno", "ContasReceber",
                    $"Estornou parcela da conta {dto.ContaId}");

            return result;
        }

        public async Task VerificarVencimentosAsync()
        {
            await _repository.VerificarVencimentosAsync();
            await _logService.RegistrarAsync("Verificação", "ContasReceber",
                "Verificação de vencimentos de contas a receber executada.");
        }

        public async Task<bool> ExisteParaPedidoAsync(Guid pedidoVendaId)
            => await _repository.ExisteParaPedidoAsync(pedidoVendaId);
    }
}
