using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Lote : BaseModels
    {
        public string CodigoLote { get; private set; }
        public string? Descricao { get; private set; }
        public string? Observacoes { get; private set; }
        public StatusLote statusLote { get; private set; }
        public DateTime DataAbertura { get; private set; }
        public DateTime? DataConclusao { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; }

        public Guid AlmoxarifadoId { get; private set; }
        public Almoxarifado Almoxarifado { get; private set; }

        public List<OrdemDeProducao> OrdensDeProducao { get; private set; } = new();

        protected Lote() { }

        public Lote(string codigoLote, Guid produtoId, Guid almoxarifadoId,
            string? descricao = null, string? observacoes = null)
        {
            CodigoLote = codigoLote;
            ProdutoId = produtoId;
            AlmoxarifadoId = almoxarifadoId;
            Descricao = descricao;
            Observacoes = observacoes;
            statusLote = StatusLote.Pendente;
            DataAbertura = DateTime.UtcNow;
        }

        public void Atualizar(string codigoLote, DateTime dataAbertura, DateTime? dataConclusao, bool ativo)
        {
            CodigoLote = codigoLote;
            DataAbertura = dataAbertura;
            DataConclusao = dataConclusao;
            DefinirAtivo(ativo);
        }

        public void IniciarProducao() => statusLote = StatusLote.EmProducao;

        public void Concluir()
        {
            statusLote = StatusLote.Concluido;
            DataConclusao = DateTime.UtcNow;
        }

        public void Cancelar() => statusLote = StatusLote.Cancelado;

        public void DefinirStatusLote(StatusLote status) => statusLote = status;
        public void DefinirDataConclusao(DateTime? data) => DataConclusao = data;
    }
}
