namespace Valisys_Production.Models.Common
{
    public abstract class BaseModels
    {
        public Guid Id { get; private set; }
        public bool Ativo { get; private set; }
        public DateTime DataCadastro { get; private set; }
        public DateTime CriadoEm { get; private set; }
        public DateTime AtualizadoEm { get; private set; }
        public DateTime DesativadoEm { get; private set; }
        public string? CriadoPor { get; private set; }
        public string? AtualizadoPor { get; private set; }

        protected BaseModels()
        {
            Id = Guid.NewGuid();
            Ativo = true;
            CriadoEm = DateTime.UtcNow;
            DataCadastro = DateTime.UtcNow;
        }

        public void DefinirAtivo(bool ativo) => Ativo = ativo;
        public void DefinirDataCadastro(DateTime data) => DataCadastro = data;
    }
}
