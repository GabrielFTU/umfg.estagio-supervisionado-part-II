using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class TabelaDePreco : BaseModels
    {
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }
        public DateOnly DataValidade { get; private set; }
        public string? TipoCliente { get; private set; }

        protected TabelaDePreco() { }

        public TabelaDePreco(string nome, DateOnly dataValidade,
            string? descricao = null, string? tipoCliente = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            DataValidade = dataValidade;
            Descricao = descricao;
            TipoCliente = tipoCliente;
        }

        public void Atualizar(string nome, DateOnly dataValidade, string? descricao, string? tipoCliente)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            DataValidade = dataValidade;
            Descricao = descricao;
            TipoCliente = tipoCliente;
            RegistrarAtualizacao();
        }
    }

    public class ItemTabelaPreco : BaseModels
    {
        public Guid TabelaPrecoId { get; private set; }
        public Guid ProdutoId { get; private set; }
        public decimal Valor { get; private set; }
        public decimal PercDescMaximo { get; private set; }
        public TabelaDePreco TabelaDePreco { get; private set; } = null!;
        public Produto Produto { get; private set; } = null!;

        protected ItemTabelaPreco() { }

        public ItemTabelaPreco(Guid tabelaPrecoId, Guid produtoId, decimal valor, decimal percDescMaximo)
        {
            if (valor < 0)
                throw new ArgumentException("O valor não pode ser negativo.");

            TabelaPrecoId = tabelaPrecoId;
            ProdutoId = produtoId;
            Valor = valor;
            PercDescMaximo = percDescMaximo;
        }

        public void Atualizar(decimal valor, decimal percDescMaximo)
        {
            if (valor < 0)
                throw new ArgumentException("O valor não pode ser negativo.");

            Valor = valor;
            PercDescMaximo = percDescMaximo;
            RegistrarAtualizacao();
        }
    }
}
