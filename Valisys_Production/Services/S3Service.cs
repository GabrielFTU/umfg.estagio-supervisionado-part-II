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

        public async Task<string> UploadAsync(IFormFile arquivo, string pasta)
        {
            var ext      = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
            var chave    = $"{pasta.Trim('/')}/{Guid.NewGuid()}{ext}";
            var mimeType = arquivo.ContentType;

            await using var stream = arquivo.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName  = _bucket,
                Key         = chave,
                InputStream = stream,
                ContentType = mimeType,
                CannedACL   = S3CannedACL.PublicRead,
            };

            await _s3.PutObjectAsync(request);

            return $"https://{_bucket}.s3.{_region}.amazonaws.com/{chave}";
        }

        public async Task DeleteAsync(string url)
        {
            // Extrai a chave a partir da URL pública
            var uri   = new Uri(url);
            var chave = uri.AbsolutePath.TrimStart('/');

            await _s3.DeleteObjectAsync(_bucket, chave);
        }
    }
}
