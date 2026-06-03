namespace Valisys_Production.Models.Enums
{
    [Flags]
    public enum PapelPessoa
    {
        Nenhum      = 0,
        Cliente     = 1,
        Colaborador = 2,
        Fornecedor  = 4,
        Vendedor    = 8
    }

    public enum SexoPessoa
    {
        NaoInformado = 0,
        Masculino    = 1,
        Feminino     = 2,
        Outro        = 3
    }
}
