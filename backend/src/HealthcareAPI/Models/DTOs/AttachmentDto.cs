namespace HealthcareAPI.Models.DTOs
{
    public class AttachmentDto
    {
        public required string FileKey { get; set; }
        public required string FileName { get; set; }
        public required string DownloadUrl { get; set; }
    }
}
