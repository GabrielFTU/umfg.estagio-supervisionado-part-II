using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class RoteiroProducaoEtapa : BaseModels
    {
        public Guid RoteiroProducaoId { get; private set; }
        public RoteiroProducao RoteiroProducao { get; private set; }

        public Guid FaseProducaoId { get; private set; }
        public FaseProducao FaseProducao { get; private set; }

        public int Ordem { get; private set; }
        public int TempoDias { get; private set; }
        public string? Instrucoes { get; private set; }

        protected RoteiroProducaoEtapa() { }

        public RoteiroProducaoEtapa(Guid faseProducaoId, int ordem, int tempoDias, string? instrucoes = null)
        {
            FaseProducaoId = faseProducaoId;
            Ordem = ordem;
            TempoDias = tempoDias;
            Instrucoes = instrucoes;
        }

        public void Atualizar(Guid faseProducaoId, int ordem, int tempoDias, string? instrucoes)
        {
            FaseProducaoId = faseProducaoId;
            Ordem = ordem;
            TempoDias = tempoDias;
            Instrucoes = instrucoes;
        }
    }
}
