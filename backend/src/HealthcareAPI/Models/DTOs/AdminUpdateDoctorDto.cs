using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class AdminUpdateDoctorDto
    {
        [Required]
        [MaxLength(100)]
        public required string FullName { get; set; }
        [Required]
        public required string Specialization { get; set; }
        public int YearsOfExperience { get; set; }
        [Range(0, 10000)]
        public decimal ConsultationFee { get; set; }
        public string? Biography { get; set; }
        [MaxLength(50)]
        public string? LicenseNumber { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
