using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthcareAPI.Models
{
    public class MedicalRecord
    {
        [Key]
        public int RecordId { get; set; }

        // Foreign Key to the completed appointment
        [Required]
        public int AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;

        [Required]
        public int PatientId { get; set; }
        public User Patient { get; set; } = null!;

        [Required]
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!;

        [Required]
        public required string Diagnosis { get; set; }

        public string? Symptoms { get; set; } // Symptoms observed by the doctor

        public string? TreatmentPlan { get; set; }

        [Column(TypeName = "jsonb")]
        public string? Attachments { get; set; } // Store as a JSON array of S3 file keys/URLs

        public string? BlockchainHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }
}
