using System;

namespace Valisys_Production.DTOs
{
    public class TipoOrdemDeProducaoReadDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; }
        public int Codigo { get; set; }
        public string? Descricao { get; set; }
        public bool Ativo { get; set; }
    }
}