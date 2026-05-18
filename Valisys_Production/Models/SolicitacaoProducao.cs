using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class SolicitacaoProducao : BaseModels
    {
        public string CodigoSolicitacao { get; private set; }
        public StatusSolicitacaoProducao Status { get; private set; }
        public DateTime DataSolicitacao { get; private set; }
        public DateTime? DataAprovacao { get; private set; }
        public string? Observacoes { get; private set; }
        public int Quantidade { get; private set; }

        public Guid? EncarregadoId { get; private set; }
        public Usuario Encarregado { get; private set; }

        public Guid? UsuarioAprovacaoId { get; private set; }
        public Usuario UsuarioAprovacao { get; private set; }

        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; }

        public Guid? TipoOrdemDeProducaoId { get; private set; }
        public TipoOrdemDeProducao TipoOrdemDeProducao { get; private set; }

        public OrdemDeProducao OrdemDeProducao { get; private set; }

        public List<SolicitacaoProducaoItem> Itens { get; private set; } = new();

        protected SolicitacaoProducao() { }

        public SolicitacaoProducao(string codigoSolicitacao, Guid produtoId, int quantidade,
            Guid? encarregadoId = null, Guid? tipoOrdemDeProducaoId = null, string? observacoes = null)
        {
            CodigoSolicitacao = codigoSolicitacao;
            ProdutoId = produtoId;
            Quantidade = quantidade;
            EncarregadoId = encarregadoId;
            TipoOrdemDeProducaoId = tipoOrdemDeProducaoId;
            Observacoes = observacoes;
            Status = StatusSolicitacaoProducao.Pendente;
            DataSolicitacao = DateTime.UtcNow;
        }

        public void Aprovar(Guid usuarioAprovacaoId)
        {
            Status = StatusSolicitacaoProducao.Aprovada;
            UsuarioAprovacaoId = usuarioAprovacaoId;
            DataAprovacao = DateTime.UtcNow;
        }

        public void DefinirStatus(StatusSolicitacaoProducao status) => Status = status;

        public void Atualizar(string codigoSolicitacao, int quantidade, Guid produtoId,
            Guid? tipoOrdemDeProducaoId, string? observacoes)
        {
            CodigoSolicitacao = codigoSolicitacao;
            Quantidade = quantidade;
            ProdutoId = produtoId;
            TipoOrdemDeProducaoId = tipoOrdemDeProducaoId;
            Observacoes = observacoes;
        }
    }
}
