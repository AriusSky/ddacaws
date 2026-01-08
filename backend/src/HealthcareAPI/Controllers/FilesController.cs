using Amazon.S3;
using HealthcareAPI.Constants;
using HealthcareAPI.Services;
using HealthcareAPI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;
using System.Web;

namespace HealthcareAPI.Controllers
{
    [ApiController]
    [Route("api/files")]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly S3Service _s3Service;

        public FilesController(S3Service s3Service)
        {
            _s3Service = s3Service;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                var fileKey = await _s3Service.UploadFileAsync(file);

                // We still generate the download URL here, pointing to our own API.
                var downloadUrl = Url.Action(nameof(DownloadFile), "Files",
                    new { fileKey = HttpUtility.UrlEncode(fileKey) }, Request.Scheme);

                return Ok(new { fileKey, downloadUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An internal error occurred: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> ListFiles([FromQuery] string? fileType = null)
        {
            var files = await _s3Service.ListFilesAsync(fileType);

            // For each file, generate its download URL
            var response = files.Select(f => new
            {
                f.FileKey,
                f.FileName,
                f.UploadedAt,
                DownloadUrl = Url.Action(nameof(DownloadFile), "Files",
                    new { fileKey = HttpUtility.UrlEncode(f.FileKey) }, Request.Scheme)
            });

            return Ok(response);
        }

        [HttpDelete("{fileKey}")]
        public async Task<IActionResult> DeleteFile(string fileKey)
        {
            var decodedKey = HttpUtility.UrlDecode(fileKey);
            await _s3Service.DeleteFileAsync(decodedKey);
            return Ok(new { message = "File deleted successfully." });
        }

        [HttpGet("download/{fileKey}", Name = RouteNames.DownloadFile)]
        public async Task<IActionResult> DownloadFile(string fileKey)
        {
            var decodedKey = HttpUtility.UrlDecode(fileKey);

            try
            {
                var s3Object = await _s3Service.GetFileStreamAsync(decodedKey);

                // Add CORS header to allow cross-origin image loading
                Response.Headers["Access-Control-Allow-Origin"] = "*";
                
                // The FileStreamResult will take ownership and dispose the stream
                return new FileStreamResult(s3Object.ResponseStream, s3Object.Headers.ContentType)
                {

                    FileDownloadName = FileNameHelper.GetOriginalFileName(decodedKey),
                };
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound($"File with key '{decodedKey}' not found.");
            }
            catch (Exception ex)
            {
                // Note: The s3Object is not available here, so we can't dispose it.
                // It's handled by the garbage collector since we didn't use 'using'.
                return StatusCode(500, $"An internal error occurred: {ex.Message}");
            }
        }
    }
}
