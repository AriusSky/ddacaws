using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class CreateDoctorDto
    {
        // User details
        [Required]
        [MaxLength(100)]
        public required string FullName { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MinLength(8)]
        public required string Password { get; set; }

        // Doctor profile details
        [Required]
        public required string Specialization { get; set; }

        public int YearsOfExperience { get; set; }
        public decimal ConsultationFee { get; set; }
        public string? Biography { get; set; }
    }
}
