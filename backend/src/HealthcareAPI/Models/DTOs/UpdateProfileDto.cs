using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HealthcareAPI.Models.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(100)]
        public required string FullName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        public string? Address { get; set; }

        [JsonPropertyName("avatarUrl")]
        public string? ProfileImageUrl { get; set; }
    }
}
