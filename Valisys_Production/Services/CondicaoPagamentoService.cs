using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class CondicaoPagamentoService(ICondicaoPagamentoRepository repo) : ICondicaoPagamentoService
    {
        public async Task<CondicaoPagamentoReadDto> CreateAsync(CondicaoPagamentoCreateDto dto)
        {
            if (await repo.NomeExisteAsync(dto.Nome))
                throw new InvalidOperationException($"Já existe uma condição de pagamento com o nome '{dto.Nome}'.");

            ValidarParcelas(dto.Parcelas);

            var codigo    = await repo.GetProximoCodigoAsync();
            var condicao  = new CondicaoPagamento(codigo, dto.Nome, dto.NumeroParcelas,
                dto.DiasParaPrimeiroVencimento, dto.DiasEntreParcelas, dto.VencimentoDiaFixo);

            var parcelas = dto.Parcelas.Select(p => new ParcelaCondicao(condicao.Id, p.Numero, p.NumeroDias, p.Percentual));
            condicao.SetParcelas(parcelas);

            await repo.AddAsync(condicao);
            await repo.SaveChangesAsync();
            return Map(condicao);
        }

        public async Task<CondicaoPagamentoReadDto?> GetByIdAsync(Guid id)
        {
            var c = await repo.GetByIdAsync(id);
            return c is null ? null : Map(c);
        }

        public async Task<IEnumerable<CondicaoPagamentoReadDto>> GetAllAsync()
        {
            var lista = await repo.GetAllAsync();
            return lista.Select(Map);
        }

        public async Task<CondicaoPagamentoReadDto> UpdateAsync(CondicaoPagamentoUpdateDto dto)
        {
            var c = await repo.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Condição de pagamento não encontrada.");

            if (await repo.NomeExisteAsync(dto.Nome, dto.Id))
                throw new InvalidOperationException($"Já existe uma condição de pagamento com o nome '{dto.Nome}'.");

            ValidarParcelas(dto.Parcelas);

            c.Atualizar(dto.Nome, dto.NumeroParcelas, dto.DiasParaPrimeiroVencimento,
                dto.DiasEntreParcelas, dto.VencimentoDiaFixo, dto.Ativo);

            var novasParcelas = dto.Parcelas
                .Select(p => new ParcelaCondicao(c.Id, p.Numero, p.NumeroDias, p.Percentual))
                .ToList();

            await repo.UpdateWithParcelasAsync(c, novasParcelas);
            await repo.SaveChangesAsync();
            var atualizado = await repo.GetByIdAsync(c.Id);
            return Map(atualizado!);
        }

        public async Task DeleteAsync(Guid id)
        {
            var c = await repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Condição de pagamento não encontrada.");
            c.Desativar();
            await repo.SaveChangesAsync();
        }

        private static void ValidarParcelas(List<ParcelaCondicaoDto> parcelas)
        {
            if (parcelas.Count == 0)
                throw new InvalidOperationException("A condição de pagamento deve ter ao menos uma parcela.");

            var soma = parcelas.Sum(p => p.Percentual);
            if (Math.Abs(soma - 100m) > 0.01m)
                throw new InvalidOperationException(
                    $"A soma dos percentuais das parcelas deve ser 100%. Valor informado: {soma:0.##}%.");
        }

        private static CondicaoPagamentoReadDto Map(CondicaoPagamento c) => new()
        {
            Id                         = c.Id,
            Codigo                     = c.Codigo,
            Nome                       = c.Nome,
            NumeroParcelas             = c.NumeroParcelas,
            DiasParaPrimeiroVencimento = c.DiasParaPrimeiroVencimento,
            DiasEntreParcelas         = c.DiasEntreParcelas,
            VencimentoDiaFixo          = c.VencimentoDiaFixo,
            Ativo                      = c.Ativo,
            CriadoEm                   = c.CriadoEm,
            Parcelas                   = c.Parcelas
                .OrderBy(p => p.Numero)
                .Select(p => new ParcelaCondicaoDto(p.Numero, p.NumeroDias, p.Percentual))
                .ToList(),
        };
    }
}
