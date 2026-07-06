using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Lote : BaseModels
    {
        private readonly List<OrdemDeProducao> _ordensDeProducao = new();

        public string CodigoLote { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }
        public string? Observacoes { get; private set; }
        public StatusLote Status { get; private set; }
        public DateTime DataAbertura { get; private set; }
        public DateTime? DataConclusao { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public Guid AlmoxarifadoId { get; private set; }
        public Almoxarifado Almoxarifado { get; private set; } = null!;

        public IReadOnlyCollection<OrdemDeProducao> OrdensDeProducao => _ordensDeProducao.AsReadOnly();

        protected Lote() { }

        public Lote(string codigoLote, Guid produtoId, Guid almoxarifadoId,
            string? descricao = null, string? observacoes = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(codigoLote);

            CodigoLote = codigoLote;
            ProdutoId = produtoId;
            AlmoxarifadoId = almoxarifadoId;
            Descricao = descricao;
            Observacoes = observacoes;
            Status = StatusLote.Pendente;
            DataAbertura = DateTime.UtcNow;
        }

        public void Atualizar(string codigoLote, DateTime dataAbertura, DateTime? dataConclusao,
            string? descricao, string? observacoes, bool ativo)
        {
            CodigoLote = codigoLote;
            DataAbertura = dataAbertura;
            DataConclusao = dataConclusao;
            Descricao = descricao;
            Observacoes = observacoes;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }

        public void IniciarProducao() => Status = StatusLote.EmProducao;

        public void Concluir()
        {
            Status = StatusLote.Concluido;
            DataConclusao = DateTime.UtcNow;
        }

        public void Cancelar() => Status = StatusLote.Cancelado;

        public void RevertarParaPendente()
        {
            Status = StatusLote.Pendente;
            DataConclusao = null;
        }
    }
}
