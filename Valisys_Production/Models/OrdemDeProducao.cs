using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class OrdemDeProducao : BaseModels
    {
        public string CodigoOrdem { get; private set; } = string.Empty;
        public int Quantidade { get; private set; }
        public StatusOrdemDeProducao Status { get; private set; }
        public DateTime DataInicio { get; private set; }
        public DateTime? DataFim { get; private set; }
        public string? Observacoes { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;

        public Guid AlmoxarifadoId { get; private set; }
        public Almoxarifado Almoxarifado { get; private set; } = null!;

        public Guid FaseAtualId { get; private set; }
        public FaseProducao FaseAtual { get; private set; } = null!;

        public Guid? LoteId { get; private set; }
        public Lote? Lote { get; private set; }

        public Guid? ProdutoVariacaoId { get; private set; }
        public ProdutoVariacao? ProdutoVariacao { get; private set; }

        public Guid? RoteiroProducaoId { get; private set; }
        public RoteiroProducao? RoteiroProducao { get; private set; }

        public Guid TipoOrdemDeProducaoId { get; private set; }
        public TipoOrdemDeProducao TipoOrdemDeProducao { get; private set; } = null!;

        public Guid? SolicitacaoProducaoId { get; private set; }
        public SolicitacaoProducao? SolicitacaoProducao { get; private set; }

        protected OrdemDeProducao() { }

        public OrdemDeProducao(int quantidade, Guid produtoId, Guid almoxarifadoId,
            Guid faseAtualId, Guid tipoOrdemDeProducaoId,
            Guid? loteId = null, string? observacoes = null, Guid? produtoVariacaoId = null)
        {
            Quantidade = quantidade;
            ProdutoId = produtoId;
            AlmoxarifadoId = almoxarifadoId;
            FaseAtualId = faseAtualId;
            TipoOrdemDeProducaoId = tipoOrdemDeProducaoId;
            LoteId = loteId;
            Observacoes = observacoes;
            ProdutoVariacaoId = produtoVariacaoId;
            Status = StatusOrdemDeProducao.Ativa;
            DataInicio = DateTime.UtcNow;
        }

        public void DefinirCodigo(string codigo) => CodigoOrdem = codigo;

        public void DefinirRoteiro(Guid roteiroId, Guid primeiraFaseId)
        {
            RoteiroProducaoId = roteiroId;
            FaseAtualId = primeiraFaseId;
        }

        public void DefinirSolicitacao(Guid solicitacaoId) => SolicitacaoProducaoId = solicitacaoId;

        public void AvancarFase(Guid novaFaseId) => FaseAtualId = novaFaseId;

        public void Finalizar()
        {
            Status = StatusOrdemDeProducao.Finalizada;
            DataFim = DateTime.UtcNow;
        }

        public void Cancelar()
        {
            Status = StatusOrdemDeProducao.Cancelada;
            DataFim = DateTime.UtcNow;
        }

        public void Estornar()
        {
            Status = StatusOrdemDeProducao.Estornada;
            DataFim = DateTime.UtcNow;
        }

        public void Atualizar(int quantidade, string? observacoes, Guid almoxarifadoId,
            StatusOrdemDeProducao status, Guid? loteId, Guid? produtoVariacaoId = null)
        {
            Quantidade = quantidade;
            Observacoes = observacoes;
            AlmoxarifadoId = almoxarifadoId;
            Status = status;
            if (loteId.HasValue) LoteId = loteId;
            ProdutoVariacaoId = produtoVariacaoId;
            RegistrarAtualizacao();
        }
    }
}
