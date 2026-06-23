namespace Valisys_Production.Services.Interfaces
{
    public interface IS3Service
    {
        /// <summary>Faz upload de um arquivo e retorna a chave (key) do objeto no bucket.</summary>
        Task<string> UploadAsync(IFormFile arquivo, string pasta);

        /// <summary>Gera uma URL pré-assinada temporária para acesso privado ao objeto.</summary>
        Task<string> GetPresignedUrlAsync(string key, int expirationMinutes = 60);

        Task DeleteAsync(string keyOrUrl);
    }
}
