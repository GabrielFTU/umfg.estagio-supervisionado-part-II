using Valisys_Production.Models.Common;

namespace Valisys_Production.Models
{
    public class FaseProducao : BaseModels
    {
        public string Nome { get; private set; }
        public string? Descricao { get; private set; }
        public int Ordem { get; private set; }
        public int TempoPadraoDias { get; private set; }

        protected FaseProducao() { }

        public FaseProducao(string nome, int ordem, string? descricao = null, int tempoPadraoDias = 0)
        {
            Nome = nome;
            Ordem = ordem;
            Descricao = descricao;
            TempoPadraoDias = tempoPadraoDias;
        }

        public void Atualizar(string nome, int ordem, string? descricao, int tempoPadraoDias, bool ativo)
        {
            Nome = nome;
            Ordem = ordem;
            Descricao = descricao;
            TempoPadraoDias = tempoPadraoDias;
            DefinirAtivo(ativo);
        }
    }
}
