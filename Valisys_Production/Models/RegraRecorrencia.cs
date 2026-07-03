using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public sealed class RegraRecorrencia : BaseModels
    {
        public FrequenciaRecorrencia Frequencia { get; private set; }
        public int NumeroOcorrencias { get; private set; }

        protected RegraRecorrencia() { }

        public RegraRecorrencia(FrequenciaRecorrencia frequencia, int numeroOcorrencias)
        {
            if (numeroOcorrencias < 2 || numeroOcorrencias > 60)
                throw new ArgumentException("O número de repetições deve estar entre 2 e 60.");

            Frequencia = frequencia;
            NumeroOcorrencias = numeroOcorrencias;
        }
    }
}
