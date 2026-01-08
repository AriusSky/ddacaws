using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthcareAPI.Models
{
    public class Doctor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DoctorId { get; set; }
        
        // Foreign Key to User
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public required string Specialization { get; set; }

        [MaxLength(50)]
        public string? LicenseNumber { get; set; }

        public int YearsOfExperience { get; set; }
        public string? Biography { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal ConsultationFee { get; set; }
    }
}
