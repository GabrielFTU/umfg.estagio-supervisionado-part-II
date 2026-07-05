using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class FinalidadeService(IFinalidadeRepository repo) : IFinalidadeService
    {
        public async Task<FinalidadeReadDto> CreateAsync(FinalidadeCreateDto dto)
        {
            if (await repo.NomeExisteAsync(dto.Nome))
                throw new InvalidOperationException($"Já existe uma finalidade com o nome '{dto.Nome}'.");

            var codigo = await repo.GetProximoCodigoAsync();
            if (codigo > 99)
                throw new InvalidOperationException("Limite de 99 finalidades de pedido (código de 2 dígitos) atingido.");

            var finalidade = new Finalidade(codigo, dto.Nome, dto.Descricao);
            await repo.AddAsync(finalidade);
            await repo.SaveChangesAsync();
            return Map(finalidade);
        }

        public async Task<FinalidadeReadDto?> GetByIdAsync(Guid id)
        {
            var f = await repo.GetByIdAsync(id);
            return f is null ? null : Map(f);
        }

        public async Task<IEnumerable<FinalidadeReadDto>> GetAllAsync()
        {
            var lista = await repo.GetAllAsync();
            return lista.Select(Map);
        }

        public async Task<FinalidadeReadDto> UpdateAsync(FinalidadeUpdateDto dto)
        {
            var f = await repo.GetByIdAsync(dto.Id)
                ?? throw new KeyNotFoundException("Finalidade não encontrada.");

            if (await repo.NomeExisteAsync(dto.Nome, dto.Id))
                throw new InvalidOperationException($"Já existe uma finalidade com o nome '{dto.Nome}'.");

            f.Atualizar(dto.Nome, dto.Descricao, dto.Ativo);
            repo.Update(f);
            await repo.SaveChangesAsync();
            return Map(f);
        }

        public async Task DeleteAsync(Guid id)
        {
            var f = await repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Finalidade não encontrada.");
            f.Desativar();
            repo.Update(f);
            await repo.SaveChangesAsync();
        }

        private static FinalidadeReadDto Map(Finalidade f) => new()
        {
            Id        = f.Id,
            Codigo    = f.Codigo,
            Nome      = f.Nome,
            Descricao = f.Descricao,
            Ativo     = f.Ativo,
            CriadoEm = f.CriadoEm,
        };
    }
}
