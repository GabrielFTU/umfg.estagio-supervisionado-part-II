using System;

namespace Valisys_Production.DTOs
{
    public class NotificacaoReadDto
    {
        public Guid Id { get; set; }
        public string Titulo { get; set; }
        public string Mensagem { get; set; }
        public string Tipo { get; set; }
        public Guid? OrdemDeProducaoId { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
