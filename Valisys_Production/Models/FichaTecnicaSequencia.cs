using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FichaTecnicaSequencia : BaseModels
    {
        public Guid FichaTecnicaId { get; private set; }
        public FichaTecnica FichaTecnica { get; private set; } = null!;

        public Guid FaseProducaoId { get; private set; }
        public FaseProducao FaseProducao { get; private set; } = null!;

        public int Ordem { get; private set; }
        public string Descricao { get; private set; } = string.Empty;
        public string? Observacao { get; private set; }
        public int TempoEstimadoDias { get; private set; }

        protected FichaTecnicaSequencia() { }

        public FichaTecnicaSequencia(Guid faseProducaoId, int ordem, string descricao, string? observacao = null, int tempoEstimadoDias = 0)
        {
            if (ordem <= 0)
                throw new ArgumentException("A ordem deve ser maior que zero.");
            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            FaseProducaoId = faseProducaoId;
            Ordem = ordem;
            Descricao = descricao;
            Observacao = observacao;
            TempoEstimadoDias = tempoEstimadoDias;
        }

        public void SetFichaTecnicaId(Guid fichaTecnicaId) => FichaTecnicaId = fichaTecnicaId;

        public void Atualizar(Guid faseProducaoId, int ordem, string descricao, string? observacao, int tempoEstimadoDias)
        {
            if (ordem <= 0)
                throw new ArgumentException("A ordem deve ser maior que zero.");
            ArgumentException.ThrowIfNullOrWhiteSpace(descricao);

            FaseProducaoId = faseProducaoId;
            Ordem = ordem;
            Descricao = descricao;
            Observacao = observacao;
            TempoEstimadoDias = tempoEstimadoDias;
            RegistrarAtualizacao();
        }
    }
}
