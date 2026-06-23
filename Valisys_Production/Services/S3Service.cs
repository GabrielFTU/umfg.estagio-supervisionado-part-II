using Amazon.S3;
using Amazon.S3.Model;
using Valisys_Production.Services.Interfaces;

namespace Valisys_Production.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3;
        private readonly string _bucket;
        private readonly string _region;

        public S3Service(IAmazonS3 s3, IConfiguration config)
        {
            _s3     = s3;
            _bucket = config["Aws:BucketName"] ?? throw new InvalidOperationException("Aws:BucketName não configurado.");
            _region = config["Aws:Region"]     ?? "us-east-1";
        }

        /// <summary>
        /// Faz upload com ACL privada (sem acesso público).
        /// Retorna a key do objeto — guarde-a no banco, não a URL pública.
        /// </summary>
        public async Task<string> UploadAsync(IFormFile arquivo, string pasta)
        {
            var ext   = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
            var chave = $"{pasta.Trim('/')}/{Guid.NewGuid()}{ext}";

            await using var stream = arquivo.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName  = _bucket,
                Key         = chave,
                InputStream = stream,
                ContentType = arquivo.ContentType,
                // Sem CannedACL: o objeto herda a política do bucket (privado por padrão)
            };

            await _s3.PutObjectAsync(request);
            return chave;
        }

        /// <summary>
        /// Gera URL pré-assinada de acesso temporário ao objeto privado.
        /// </summary>
        public async Task<string> GetPresignedUrlAsync(string key, int expirationMinutes = 60)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucket,
                Key        = key,
                Expires    = DateTime.UtcNow.AddMinutes(expirationMinutes),
                Protocol   = Protocol.HTTPS,
                Verb       = HttpVerb.GET,
            };

            // GetPreSignedURL é síncrono na SDK v3; envolto em Task para manter a interface assíncrona
            return await Task.FromResult(_s3.GetPreSignedURL(request));
        }

        public async Task DeleteAsync(string keyOrUrl)
        {
            // Aceita tanto a key direta quanto a URL completa do S3
            var key = keyOrUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? new Uri(keyOrUrl).AbsolutePath.TrimStart('/')
                : keyOrUrl;

            await _s3.DeleteObjectAsync(_bucket, key);
        }
    }
}
