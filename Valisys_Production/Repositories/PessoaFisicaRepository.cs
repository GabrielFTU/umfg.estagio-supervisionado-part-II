using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class PessoaFisicaRepository : Repository<PessoaFisica>, IPessoaFisicaRepository
    {
        public PessoaFisicaRepository(ApplicationDbContext context) : base(context) { }
    }
}
