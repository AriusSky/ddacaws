using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthcareAPI.Models
{
    public class Prescription
    {
        [Key]
        public int PrescriptionId { get; set; }

        [Required]
        public int RecordId { get; set; }
        public MedicalRecord MedicalRecord { get; set; } = null!;

        [Required]
        public int PatientId { get; set; }
        public User Patient { get; set; } = null!;

        [Required]
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!;

        [Required]
        [Column(TypeName = "jsonb")]
        // JSON array of 'PrescribedMedicationDto' objects
        public required string Medications { get; set; } 
        
        //general notes for the whole prescription
        public string? GeneralInstructions { get; set; } 

        public string? BlockchainHash { get; set; }

        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    }
}
