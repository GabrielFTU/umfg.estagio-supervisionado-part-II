using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class Produto : BaseModels
    {
        public int CodigoInternoProduto { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string Descricao { get; private set; } = string.Empty;
        public string? Observacoes { get; private set; }
        public ClassificacaoEnum Classificacao { get; private set; }
        public bool ControlarPorLote { get; private set; }
        public decimal EstoqueMinimo { get; private set; }
        public Guid UnidadeMedidaId { get; private set; }
        public UnidadeMedida UnidadeMedida { get; private set; } = null!;
        public Guid CategoriaProdutoId { get; private set; }
        public CategoriaProduto CategoriaProduto { get; private set; } = null!;

        protected Produto() { }

        public Produto(string nome, string descricao, ClassificacaoEnum classificacao,
            bool controlarPorLote, Guid unidadeMedidaId, Guid categoriaProdutoId,
            string? observacoes = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Descricao = descricao;
            Classificacao = classificacao;
            ControlarPorLote = controlarPorLote;
            UnidadeMedidaId = unidadeMedidaId;
            CategoriaProdutoId = categoriaProdutoId;
            Observacoes = observacoes;
        }

        public void DefinirCodigo(int codigo) => CodigoInternoProduto = codigo;

        public void Atualizar(string nome, string descricao, ClassificacaoEnum classificacao,
            bool controlarPorLote, decimal estoqueMinimo, Guid unidadeMedidaId,
            Guid categoriaProdutoId, string? observacoes, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Descricao = descricao;
            Classificacao = classificacao;
            ControlarPorLote = controlarPorLote;
            EstoqueMinimo = estoqueMinimo;
            UnidadeMedidaId = unidadeMedidaId;
            CategoriaProdutoId = categoriaProdutoId;
            Observacoes = observacoes;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
