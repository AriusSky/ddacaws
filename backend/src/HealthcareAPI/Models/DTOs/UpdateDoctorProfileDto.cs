using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HealthcareAPI.Models.DTOs
{
    public class UpdateDoctorProfileDto
    {
        // User properties
        [MaxLength(100)]
        public string? FullName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        public string? Address { get; set; }

        [JsonPropertyName("profileImageUrl")]
        public string? ProfileImageUrl { get; set; }

        // Doctor-specific properties
        public string? Specialization { get; set; }

        public int? YearsOfExperience { get; set; }

        public string? Biography { get; set; }

        public decimal? ConsultationFee { get; set; }
    }
}
