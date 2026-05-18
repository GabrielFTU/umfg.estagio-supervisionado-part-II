namespace Valisys_Production.Models.Common
{
    public sealed record Endereco(
        string Cep,
        string Logradouro,
        string Numero,
        string? Complemento,
        string Bairro,
        string Cidade,
        string Uf,
        string? CodigoIbge = null)
    {
        public static Endereco Criar(string cep,
                                     string logradouro,
                                     string numero,
                                     string? complemento,
                                     string bairro,
                                     string cidade,
                                     string uf,
                                     string? codigoIbge = null)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(cep);
            ArgumentException.ThrowIfNullOrWhiteSpace(logradouro);
            ArgumentException.ThrowIfNullOrWhiteSpace(numero);
            ArgumentException.ThrowIfNullOrWhiteSpace(bairro);
            ArgumentException.ThrowIfNullOrWhiteSpace(cidade);
            ArgumentException.ThrowIfNullOrWhiteSpace(uf);

            return new Endereco(cep, logradouro, numero, complemento, bairro, cidade, uf, codigoIbge);
        }
    }
}