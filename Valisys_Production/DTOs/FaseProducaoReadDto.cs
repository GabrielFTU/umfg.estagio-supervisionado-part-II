using System;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class FaseProducaoReadDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public int Ordem { get; set; }
        public int TempoPadraoDias { get; set; }
        public bool Ativo { get; set; }
        public TipoFase TipoFase { get; set; }
    }
}