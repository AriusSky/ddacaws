using Amazon.S3;
using Amazon.S3.Model;
using System.IO;
using System.Runtime;
using System.Linq;
using Microsoft.AspNetCore.Http;
using HealthcareAPI.Utils;

namespace HealthcareAPI.Services
{
    // Define a simple DTO for file info to be used by the service and controller
    public class S3FileInfo
    {
        public required string FileKey { get; set; }
        public required string FileName { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class S3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;

        public S3Service(IAmazonS3 s3Client, IConfiguration config)
        {
            _s3Client = s3Client;
            _bucketName = config["BucketName"]!;
            if (string.IsNullOrEmpty(_bucketName))
            {
                throw new InvalidOperationException("AWS S3 BucketName is not configured.");
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            var key = $"uploads/{Guid.NewGuid()}_{file.FileName}";
            using var stream = file.OpenReadStream();
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };
            await _s3Client.PutObjectAsync(request);
            return key;
        }

        public async Task<List<S3FileInfo>> ListFilesAsync(string? fileType = null)
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = "uploads/"
            };

            var response = await _s3Client.ListObjectsV2Async(request);
            var s3Objects = response.S3Objects ?? Enumerable.Empty<S3Object>();

            return s3Objects
                .Where(o => o.Key.Length > request.Prefix.Length) // Filter out the folder itself
                .Where(o => string.IsNullOrEmpty(fileType) || o.Key.Contains(fileType))
                .Select(o => new S3FileInfo
                {
                    FileKey = o.Key,
                    FileName = FileNameHelper.GetOriginalFileName(o.Key),
                    UploadedAt = o.LastModified.HasValue
                                ? o.LastModified.Value.ToUniversalTime()
                                : DateTime.MinValue
                })
                .ToList();
        }

        public async Task DeleteFileAsync(string fileKey)
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileKey
            };
            await _s3Client.DeleteObjectAsync(request);
        }

        public async Task<GetObjectResponse> GetFileStreamAsync(string fileKey)
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = fileKey
            };
            return await _s3Client.GetObjectAsync(request);
        }
    }
}
