namespace Valisys_Production.Models.Common
{
    public abstract class BaseModels
    {
        public Guid Id { get; private set; }
        public bool Ativo { get; private set; }
        public DateTime DataCadastro { get; private set; }
        public DateTime CriadoEm { get; private set; }
        public DateTime? AtualizadoEm { get; private set; }
        public DateTime? DesativadoEm { get; private set; }
        public string? CriadoPor { get; private set; }
        public string? AtualizadoPor { get; private set; }

        protected BaseModels()
        {
            Id = Guid.NewGuid();
            Ativo = true;
            CriadoEm = DateTime.UtcNow;
            DataCadastro = DateTime.UtcNow;
        }

        public virtual void Desativar()
        {
            Ativo = false;
            DesativadoEm = DateTime.UtcNow;
        }

        public virtual void Ativar() => Ativo = true;

        protected void RegistrarAtualizacao() => AtualizadoEm = DateTime.UtcNow;

        protected virtual void DefinirAtivo(bool ativo)
        {
            if (ativo) Ativar(); else Desativar();
        }

        public void InicializarParaSeed(Guid id, DateTime dataFixa)
        {
            Id = id;
            CriadoEm = dataFixa;
            AtualizadoEm = dataFixa;
            DataCadastro = dataFixa;
        }
    }
}
