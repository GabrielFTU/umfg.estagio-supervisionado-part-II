using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public sealed class Finalidade : BaseModels
    {
        public int Codigo { get; private set; }
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }

        protected Finalidade() { }

        public Finalidade(int codigo, string nome, string? descricao)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Codigo    = codigo;
            Nome      = nome.Trim();
            Descricao = descricao?.Trim();
        }

        public void Atualizar(string nome, string? descricao, bool ativo)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);
            Nome      = nome.Trim();
            Descricao = descricao?.Trim();
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
