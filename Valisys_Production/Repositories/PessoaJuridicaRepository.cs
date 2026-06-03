using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class PessoaJuridicaRepository : Repository<PessoaJuridica>, IPessoaJuridicaRepository
    {
        public PessoaJuridicaRepository(ApplicationDbContext context) : base(context) { }
    }
}
