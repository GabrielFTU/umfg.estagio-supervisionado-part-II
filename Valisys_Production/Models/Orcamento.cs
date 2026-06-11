using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public sealed class ItemOrcamento : BaseModels
    {
        public Guid OrcamentoId { get; private set; }
        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;
        public int Quantidade { get; private set; }
        public decimal ValorUnitario { get; private set; }
        public decimal DescontoUnitario { get; private set; }
        public decimal SubTotal => (ValorUnitario - DescontoUnitario) * Quantidade;

        protected ItemOrcamento() { }

        public ItemOrcamento(Guid orcamentoId, Guid produtoId, int quantidade,
                             decimal valorUnitario, decimal descontoUnitario)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            if (valorUnitario < 0)
                throw new ArgumentException("O valor unitário não pode ser negativo.");

            if (descontoUnitario < 0 || descontoUnitario > valorUnitario)
                throw new ArgumentException("Desconto inválido.");

            OrcamentoId      = orcamentoId;
            ProdutoId        = produtoId;
            Quantidade       = quantidade;
            ValorUnitario    = valorUnitario;
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

            Quantidade       = quantidade;
            ValorUnitario    = valorUnitario;
            DescontoUnitario = descontoUnitario;
            RegistrarAtualizacao();
        }
    }

    public sealed class Orcamento : BaseModels
    {
        private readonly List<ItemOrcamento> _itens = new();

        public int Codigo { get; private set; }
        public Guid ClienteId { get; private set; }
        public Pessoa Cliente { get; private set; } = null!;
        public Guid RepresentanteId { get; private set; }
        public Usuario Representante { get; private set; } = null!;
        public DateTime DataEmissao { get; private set; }
        public DateTime? DataValidade { get; private set; }
        public decimal Desconto { get; private set; }
        public decimal Subtotal => _itens.Sum(i => i.SubTotal);
        public decimal Total => Subtotal - Desconto;
        public string? ObservacaoInterna { get; private set; }
        public string? ObservacaoExterna { get; private set; }
        public StatusOrcamento Status { get; private set; }
        public Guid? PedidoVendaConvertidoId { get; private set; }
        public IReadOnlyCollection<ItemOrcamento> Itens => _itens.AsReadOnly();

        protected Orcamento() { }

        public Orcamento(int codigo, Guid clienteId, Guid representanteId, DateTime? dataValidade = null)
        {
            Codigo           = codigo;
            ClienteId        = clienteId;
            RepresentanteId  = representanteId;
            DataEmissao      = DateTime.UtcNow;
            DataValidade     = dataValidade;
            Status           = StatusOrcamento.Rascunho;
        }

        public void Enviar()
        {
            if (Status != StatusOrcamento.Rascunho)
                throw new InvalidOperationException("Apenas rascunhos podem ser enviados.");
            Status = StatusOrcamento.Enviado;
        }

        public void Aprovar()
        {
            if (Status != StatusOrcamento.Enviado)
                throw new InvalidOperationException("Apenas orçamentos enviados podem ser aprovados.");
            Status = StatusOrcamento.Aprovado;
        }

        public void Expirar()
        {
            if (Status == StatusOrcamento.Cancelado || Status == StatusOrcamento.ConvertidoEmPedido)
                throw new InvalidOperationException("Este orçamento não pode ser expirado.");
            Status = StatusOrcamento.Expirado;
        }

        public void Cancelar()
        {
            if (Status == StatusOrcamento.ConvertidoEmPedido)
                throw new InvalidOperationException("Orçamentos já convertidos em pedido não podem ser cancelados.");
            Status = StatusOrcamento.Cancelado;
        }

        public void MarcarComoConvertido(Guid pedidoVendaId)
        {
            if (Status == StatusOrcamento.Cancelado)
                throw new InvalidOperationException("Orçamentos cancelados não podem ser convertidos em pedido.");

            if (Status == StatusOrcamento.ConvertidoEmPedido)
                throw new InvalidOperationException("Este orçamento já foi convertido em pedido.");

            Status                  = StatusOrcamento.ConvertidoEmPedido;
            PedidoVendaConvertidoId = pedidoVendaId;
        }

        public void Atualizar(Guid clienteId, Guid representanteId, DateTime? dataValidade,
                              decimal desconto, string? observacaoInterna, string? observacaoExterna)
        {
            if (desconto < 0)
                throw new ArgumentException("Desconto inválido.");

            ClienteId           = clienteId;
            RepresentanteId     = representanteId;
            DataValidade        = dataValidade;
            Desconto            = desconto;
            ObservacaoInterna   = observacaoInterna;
            ObservacaoExterna   = observacaoExterna;
            RegistrarAtualizacao();
        }

        public void AdicionarItem(Guid produtoId, int quantidade, decimal valorUnitario, decimal descontoUnitario)
        {
            var existente = _itens.FirstOrDefault(i => i.ProdutoId == produtoId);

            if (existente != null)
                existente.Atualizar(existente.Quantidade + quantidade, valorUnitario, descontoUnitario);
            else
                _itens.Add(new ItemOrcamento(Id, produtoId, quantidade, valorUnitario, descontoUnitario));
        }

        public void RemoverItem(Guid produtoId)
        {
            var item = _itens.FirstOrDefault(i => i.ProdutoId == produtoId);
            if (item != null) _itens.Remove(item);
        }

        public void LimparItens() => _itens.Clear();
    }
}
