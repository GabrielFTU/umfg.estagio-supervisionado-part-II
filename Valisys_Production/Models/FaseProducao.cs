using Valisys_Production.Models.Common;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Models
{
    public class FaseProducao : BaseModels
    {
        public string Nome { get; private set; } = string.Empty;
        public string? Descricao { get; private set; }
        public int Ordem { get; private set; }
        public int TempoPadraoDias { get; private set; }
        public TipoFase TipoFase { get; private set; } = TipoFase.Intermediaria;

        protected FaseProducao() { }

        public FaseProducao(string nome, int ordem, string? descricao = null, int tempoPadraoDias = 0, TipoFase tipoFase = TipoFase.Intermediaria)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Ordem = ordem;
            Descricao = descricao;
            TempoPadraoDias = tempoPadraoDias;
            TipoFase = tipoFase;
        }

        public void Atualizar(string nome, int ordem, string? descricao, int tempoPadraoDias, bool ativo, TipoFase tipoFase = TipoFase.Intermediaria)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(nome);

            Nome = nome;
            Ordem = ordem;
            Descricao = descricao;
            TempoPadraoDias = tempoPadraoDias;
            TipoFase = tipoFase;
            DefinirAtivo(ativo);
            RegistrarAtualizacao();
        }
    }
}
