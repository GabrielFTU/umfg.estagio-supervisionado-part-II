namespace Valisys_Production.Services.Interfaces
{
    public interface IS3Service
    {
        Task<string> UploadAsync(IFormFile arquivo, string pasta);
        Task DeleteAsync(string url);
    }
}
