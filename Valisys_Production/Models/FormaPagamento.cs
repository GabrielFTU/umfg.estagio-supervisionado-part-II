using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class FormaPagamento : BaseModels
    {
        private readonly List<FormaPagamentoVendedor> _vendedores = new();

        public int Codigo { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }
        public int? PrazoDias { get; private set; }

        public IReadOnlyCollection<FormaPagamentoVendedor> Vendedores => _vendedores.AsReadOnly();

        protected FormaPagamento() { }

        public FormaPagamento(int codigo, string nome, string? descricao, int? prazoDias)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Codigo     = codigo;
            Nome       = nome;
            Descricao  = descricao;
            PrazoDias  = prazoDias;
        }

        public void Atualizar(string nome, string? descricao, int? prazoDias, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Nome      = nome;
            Descricao = descricao;
            PrazoDias = prazoDias;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }

        public void AdicionarVendedor(Guid vendedorId)
        {
            if (_vendedores.Any(v => v.VendedorId == vendedorId)) return;
            _vendedores.Add(new FormaPagamentoVendedor(Id, vendedorId));
        }

        public void RemoverVendedor(Guid vendedorId)
        {
            var link = _vendedores.FirstOrDefault(v => v.VendedorId == vendedorId);
            if (link != null) _vendedores.Remove(link);
        }

        public bool VendedorPodeUsar(Guid vendedorId)
            => !_vendedores.Any() || _vendedores.Any(v => v.VendedorId == vendedorId);
    }

    public sealed class FormaPagamentoVendedor : BaseModels
    {
        public Guid FormaPagamentoId { get; private set; }
        public Guid VendedorId { get; private set; }
        public Pessoa Vendedor { get; private set; } = null!;

        protected FormaPagamentoVendedor() { }

        public FormaPagamentoVendedor(Guid formaPagamentoId, Guid vendedorId)
        {
            FormaPagamentoId = formaPagamentoId;
            VendedorId       = vendedorId;
        }
    }
}
