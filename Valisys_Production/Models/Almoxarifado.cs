using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class Almoxarifado : BaseModels
    {
        private readonly List<Deposito> _depositos = new();

        public int Codigo { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }
        public string Localizacao { get; private set; } = string.Empty;
        public string Responsavel { get; private set; } = string.Empty;
        public string? Contato { get; private set; }
        public string? Email { get; private set; }
        public IReadOnlyCollection<Deposito> Depositos => _depositos.AsReadOnly();

        protected Almoxarifado() { }

        public Almoxarifado(string nome,
                            string? descricao,
                            string localizacao,
                            string responsavel,
                            string? contato = null,
                            string? email = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(localizacao);
            ArgumentException.ThrowIfNullOrWhiteSpace(responsavel);

            Nome = nome;
            Descricao = descricao;
            Localizacao = localizacao;
            Responsavel = responsavel;
            Contato = contato;
            Email = email;
        }

        public void DefinirCodigo(int codigo) => Codigo = codigo;

        public void Atualizar(string nome,
                              string? descricao,
                              string localizacao,
                              string responsavel,
                              string? contato,
                              string? email,
                              bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            ArgumentException.ThrowIfNullOrWhiteSpace(localizacao);
            ArgumentException.ThrowIfNullOrWhiteSpace(responsavel);

            Nome = nome;
            Descricao = descricao;
            Localizacao = localizacao;
            Responsavel = responsavel;
            Contato = contato;
            Email = email;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }

        public void AdicionarDeposito(Guid almoxarifadoId, int codigoIdentificador, string nome)
        {
            if (_depositos.Any(d => d.Nome.Equals(nome, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException("Já existe um depósito com este nome neste almoxarifado.");

            _depositos.Add(new Deposito(almoxarifadoId, codigoIdentificador, nome));
        }

        public void RemoverDeposito(Guid depositoId)
        {
            var deposito = _depositos.FirstOrDefault(d => d.Id == depositoId);
            if (deposito != null)
                _depositos.Remove(deposito);
        }

        public override void Desativar()
        {
            if (Depositos.Any(d => d.Ativo))
                throw new InvalidOperationException("Não é possível desativar um almoxarifado com depósitos ativos.");

            base.Desativar();
        }
    }
}
