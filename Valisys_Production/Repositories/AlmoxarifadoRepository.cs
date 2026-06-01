using Valisys_Production.Data;
using Valisys_Production.Models;
using Valisys_Production.Repositories.Interfaces;

namespace Valisys_Production.Repositories
{
    public class AlmoxarifadoRepository : Repository<Almoxarifado>, IAlmoxarifadoRepository
    {
        public AlmoxarifadoRepository(ApplicationDbContext context) : base(context) { }
    }
}
