using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class UnidadeMedidaRepository : Repository<UnidadeMedida>, IUnidadeMedidaRepository
    {
        public UnidadeMedidaRepository(ApplicationDbContext context) : base(context) { }
    }
}
