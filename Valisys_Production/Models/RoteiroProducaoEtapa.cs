using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class RoteiroProducaoEtapa : BaseModels
    {
        public Guid RoteiroProducaoId { get; private set; }
        public RoteiroProducao RoteiroProducao { get; private set; } = null!;

        public Guid FaseProducaoId { get; private set; }
        public FaseProducao FaseProducao { get; private set; } = null!;

        public int Ordem { get; private set; }
        public int TempoDias { get; private set; }
        public string? Instrucoes { get; private set; }

        protected RoteiroProducaoEtapa() { }

        public RoteiroProducaoEtapa(Guid faseProducaoId, int ordem, int tempoDias, string? instrucoes = null)
        {
            if (ordem <= 0)
                throw new ArgumentException("A ordem deve ser maior que zero.");

            FaseProducaoId = faseProducaoId;
            Ordem = ordem;
            TempoDias = tempoDias;
            Instrucoes = instrucoes;
        }

        public void Atualizar(Guid faseProducaoId, int ordem, int tempoDias, string? instrucoes)
        {
            if (ordem <= 0)
                throw new ArgumentException("A ordem deve ser maior que zero.");

            FaseProducaoId = faseProducaoId;
            Ordem = ordem;
            TempoDias = tempoDias;
            Instrucoes = instrucoes;
            RegistrarAtualizacao();
        }
    }
}
