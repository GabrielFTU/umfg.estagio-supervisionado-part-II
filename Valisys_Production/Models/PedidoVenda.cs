using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public sealed class ItemPedido : BaseModels
    {
        public Guid PedidoVendaId { get; private set; }
        public Guid ProdutoId { get; private set; }
        public int Quantidade { get; private set; }
        public decimal ValorUnitario { get; private set; }
        public decimal DescontoUnitario { get; private set; }
        public decimal SubTotal => (ValorUnitario - DescontoUnitario) * Quantidade;

        protected ItemPedido() { }

        public ItemPedido(Guid pedidoVendaId, Guid produtoId, int quantidade,
                          decimal valorUnitario, decimal descontoUnitario)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            if (valorUnitario < 0)
                throw new ArgumentException("O valor unitário não pode ser negativo.");

            if (descontoUnitario < 0 || descontoUnitario > valorUnitario)
                throw new ArgumentException("Desconto inválido.");

            PedidoVendaId = pedidoVendaId;
            ProdutoId = produtoId;
            Quantidade = quantidade;
            ValorUnitario = valorUnitario;
            DescontoUnitario = descontoUnitario;
        }

        public void Atualizar(int quantidade, decimal valorUnitario, decimal descontoUnitario)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            if (valorUnitario < 0)
                throw new ArgumentException("O valor unitário não pode ser negativo.");

            if (descontoUnitario < 0 || descontoUnitario > valorUnitario)
                throw new ArgumentException("Desconto inválido.");

            Quantidade = quantidade;
            ValorUnitario = valorUnitario;
            DescontoUnitario = descontoUnitario;
            RegistrarAtualizacao();
        }
    }

    public sealed class PedidoVenda : BaseModels
    {
        private readonly List<ItemPedido> _itens = new();

        public int Codigo { get; private set; }
        public Guid ClienteId { get; private set; }
        public Guid RepresentanteId { get; private set; }
        public Guid FinalidadePedidoId { get; private set; }
        public Guid FormaPagamentoId { get; private set; }
        public Guid TabelaPrecoId { get; private set; }
        public DateTime DataEmissao { get; private set; }
        public DateTime? DataPrevisaoEntrega { get; private set; }
        public decimal Desconto { get; private set; }
        public decimal Subtotal => _itens.Sum(i => i.SubTotal);
        public decimal Total => Subtotal - Desconto;
        public string? ObservacaoInterna { get; private set; }
        public string? ObservacaoExterna { get; private set; }
        public StatusPedido Status { get; private set; }
        public IReadOnlyCollection<ItemPedido> Itens => _itens.AsReadOnly();

        protected PedidoVenda() { }

        public PedidoVenda(int codigo,
                           Guid clienteId,
                           Guid representanteId,
                           Guid finalidadePedidoId,
                           Guid formaPagamentoId,
                           Guid tabelaPrecoId,
                           DateTime? dataPrevisaoEntrega = null)
        {
            Codigo = codigo;
            ClienteId = clienteId;
            RepresentanteId = representanteId;
            FinalidadePedidoId = finalidadePedidoId;
            FormaPagamentoId = formaPagamentoId;
            TabelaPrecoId = tabelaPrecoId;
            DataEmissao = DateTime.UtcNow;
            DataPrevisaoEntrega = dataPrevisaoEntrega;
            Status = StatusPedido.Rascunho;
        }

        public void Confirmar() => Status = StatusPedido.Confirmado;
        public void Concluir() => Status = StatusPedido.Concluido;
        public void Cancelar() => Status = StatusPedido.Cancelado;

        public void Atualizar(Guid clienteId,
                              Guid representanteId,
                              Guid finalidadePedidoId,
                              Guid formaPagamentoId,
                              Guid tabelaPrecoId,
                              DateTime? dataPrevisaoEntrega,
                              decimal desconto,
                              string? observacaoInterna,
                              string? observacaoExterna)
        {
            if (desconto < 0 || desconto > Subtotal)
                throw new ArgumentException("Desconto inválido.");

            ClienteId = clienteId;
            RepresentanteId = representanteId;
            FinalidadePedidoId = finalidadePedidoId;
            FormaPagamentoId = formaPagamentoId;
            TabelaPrecoId = tabelaPrecoId;
            DataPrevisaoEntrega = dataPrevisaoEntrega;
            Desconto = desconto;
            ObservacaoInterna = observacaoInterna;
            ObservacaoExterna = observacaoExterna;
            RegistrarAtualizacao();
        }

        public void AdicionarItem(Guid produtoId, int quantidade, decimal valorUnitario, decimal descontoUnitario)
        {
            var itemExistente = _itens.FirstOrDefault(i => i.ProdutoId == produtoId);

            if (itemExistente != null)
                itemExistente.Atualizar(itemExistente.Quantidade + quantidade, valorUnitario, descontoUnitario);
            else
                _itens.Add(new ItemPedido(Id, produtoId, quantidade, valorUnitario, descontoUnitario));
        }

        public void RemoverItem(Guid produtoId)
        {
            var item = _itens.FirstOrDefault(i => i.ProdutoId == produtoId);
            if (item != null) _itens.Remove(item);
        }
    }
}
