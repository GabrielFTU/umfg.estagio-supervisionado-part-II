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

            var codigo    = await repo.GetProximoCodigoAsync();
            var condicao  = new CondicaoPagamento(codigo, dto.Nome, dto.NumeroParcelas,
                dto.DiasParaPrimeiroVencimento, dto.DiastEntreParcelas, dto.VencimentoDiaFixo);

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

            c.Atualizar(dto.Nome, dto.NumeroParcelas, dto.DiasParaPrimeiroVencimento,
                dto.DiastEntreParcelas, dto.VencimentoDiaFixo, dto.Ativo);

            repo.RemoveParcelas(c.Parcelas.ToList());

            var novasParcelas = dto.Parcelas.Select(p => new ParcelaCondicao(c.Id, p.Numero, p.NumeroDias, p.Percentual));
            c.SetParcelas(novasParcelas);

            repo.Update(c);
            await repo.SaveChangesAsync();
            return Map(c);
        }

        public async Task DeleteAsync(Guid id)
        {
            var c = await repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Condição de pagamento não encontrada.");
            c.Desativar();
            repo.Update(c);
            await repo.SaveChangesAsync();
        }

        private static CondicaoPagamentoReadDto Map(CondicaoPagamento c) => new()
        {
            Id                         = c.Id,
            Codigo                     = c.Codigo,
            Nome                       = c.Nome,
            NumeroParcelas             = c.NumeroParcelas,
            DiasParaPrimeiroVencimento = c.DiasParaPrimeiroVencimento,
            DiastEntreParcelas         = c.DiastEntreParcelas,
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
