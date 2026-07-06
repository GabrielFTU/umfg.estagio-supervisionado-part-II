using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public sealed class ItemInventario : BaseModels
    {
        public Guid InventarioId { get; private set; }
        public Guid ProdutoId { get; private set; }
        public Produto Produto { get; private set; } = null!;
        public decimal QuantidadeContada { get; private set; }

        protected ItemInventario() { }

        public ItemInventario(Guid inventarioId, Guid produtoId, decimal quantidadeContada)
        {
            if (produtoId == Guid.Empty)
                throw new ArgumentException("Produto é obrigatório.");

            if (quantidadeContada < 0)
                throw new ArgumentException("A quantidade contada não pode ser negativa.");

            InventarioId = inventarioId;
            ProdutoId = produtoId;
            QuantidadeContada = quantidadeContada;
        }

        public void Atualizar(decimal quantidadeContada)
        {
            if (quantidadeContada < 0)
                throw new ArgumentException("A quantidade contada não pode ser negativa.");

            QuantidadeContada = quantidadeContada;
            RegistrarAtualizacao();
        }
    }

    public sealed class Inventario : BaseModels
    {
        private readonly List<ItemInventario> _itens = new();

        public int Numero { get; private set; }
        public Guid DepositoId { get; private set; }
        public Deposito Deposito { get; private set; } = null!;
        public TipoContagemInventario TipoContagem { get; private set; }
        public string? Observacao { get; private set; }
        public StatusInventario Status { get; private set; }
        public DateTime DataAbertura { get; private set; }
        public DateTime? DataFinalizacao { get; private set; }
        public Guid UsuarioAberturaId { get; private set; }
        public Usuario UsuarioAbertura { get; private set; } = null!;
        public IReadOnlyCollection<ItemInventario> Itens => _itens.AsReadOnly();

        protected Inventario() { }

        public Inventario(int numero, Guid depositoId, TipoContagemInventario tipoContagem,
                          Guid usuarioAberturaId, string? observacao = null)
        {
            if (depositoId == Guid.Empty)
                throw new ArgumentException("Depósito é obrigatório.");

            Numero = numero;
            DepositoId = depositoId;
            TipoContagem = tipoContagem;
            UsuarioAberturaId = usuarioAberturaId;
            Observacao = observacao;
            Status = StatusInventario.Aberto;
            DataAbertura = DateTime.UtcNow;
        }

        public void Atualizar(Guid depositoId, TipoContagemInventario tipoContagem, string? observacao)
        {
            if (Status != StatusInventario.Aberto)
                throw new InvalidOperationException("Apenas inventários abertos podem ser editados.");

            if (depositoId == Guid.Empty)
                throw new ArgumentException("Depósito é obrigatório.");

            DepositoId = depositoId;
            TipoContagem = tipoContagem;
            Observacao = observacao;
            RegistrarAtualizacao();
        }

        public void AdicionarItem(Guid produtoId, decimal quantidadeContada)
        {
            var itemExistente = _itens.FirstOrDefault(i => i.ProdutoId == produtoId);

            if (itemExistente != null)
                itemExistente.Atualizar(quantidadeContada);
            else
                _itens.Add(new ItemInventario(Id, produtoId, quantidadeContada));
        }

        public void LimparItens() => _itens.Clear();

        public void Finalizar()
        {
            if (Status != StatusInventario.Aberto)
                throw new InvalidOperationException("Apenas inventários abertos podem ser finalizados.");

            if (!_itens.Any())
                throw new InvalidOperationException("Adicione ao menos um produto antes de finalizar.");

            Status = StatusInventario.Finalizado;
            DataFinalizacao = DateTime.UtcNow;
        }

        public void Cancelar()
        {
            if (Status == StatusInventario.Finalizado)
                throw new InvalidOperationException("Inventários finalizados não podem ser cancelados.");

            Status = StatusInventario.Cancelado;
        }
    }
}
