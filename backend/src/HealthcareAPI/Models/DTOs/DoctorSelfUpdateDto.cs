using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class DoctorSelfUpdateDto
    {
        [Required]
        public required string Specialization { get; set; }
        public int YearsOfExperience { get; set; }
        public string? Biography { get; set; }

        [Range(0, 10000)]
        public decimal ConsultationFee { get; set; }
        
        [MaxLength(50)]
        public string? LicenseNumber { get; set; }
    }
}
