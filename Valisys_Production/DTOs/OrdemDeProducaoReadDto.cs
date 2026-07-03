using System;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.DTOs
{
    public class OrdemDeProducaoReadDto
    {
        public Guid Id { get; set; }
        public string CodigoOrdem { get; set; }
        public int Quantidade { get; set; }
        public StatusOrdemDeProducao Status { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public string? Observacoes { get; set; }

        public Guid ProdutoId { get; set; }
        public string ProdutoNome { get; set; }
        public Guid AlmoxarifadoId { get; set; }
        public string AlmoxarifadoNome { get; set; }
        public Guid FaseAtualId { get; set; }
        public string FaseAtualNome { get; set; }
        public Guid? LoteId { get; set; }
        public string? LoteNumero { get; set; }

        public Guid? ProdutoVariacaoId { get; set; }
        public string? ProdutoVariacaoNome { get; set; }

        public Guid TipoOrdemDeProducaoId { get; set; }
        public string? TipoOrdemDeProducaoNome { get; set; }

        public Guid? RoteiroProducaoId { get; set; }
        public string? RoteiroCodigo { get; set; }

        public Guid? DepositoId { get; set; }
        public string? DepositoNome { get; set; }
    }
}