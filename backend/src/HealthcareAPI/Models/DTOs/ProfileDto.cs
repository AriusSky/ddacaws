using System.Text.Json.Serialization;

namespace HealthcareAPI.Models.DTOs
{
    public class ProfileDto
    {
        [JsonPropertyName("userId")]
        public int UserId { get; set; }
        [JsonPropertyName("email")]
        public required string Email { get; set; }
        [JsonPropertyName("fullName")]
        public required string FullName { get; set; }
        [JsonPropertyName("phoneNumber")]
        public string? PhoneNumber { get; set; }
        [JsonPropertyName("dateOfBirth")]
        public DateTime? DateOfBirth { get; set; }
        [JsonPropertyName("gender")]
        public string? Gender { get; set; }
        [JsonPropertyName("address")]
        public string? Address { get; set; }
        [JsonPropertyName("avatarUrl")]
        public string? AvatarUrl { get; set; }
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;
    }
}
