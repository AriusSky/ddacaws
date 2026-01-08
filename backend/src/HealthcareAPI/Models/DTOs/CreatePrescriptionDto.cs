using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    // This object represents a SINGLE LINE ITEM on a prescription
    public class PrescribedMedicationDto
    {
        [Required]
        public required string Name { get; set; } // e.g., "Amoxicillin"

        [Required]
        public required string Strength { get; set; } // e.g., "500mg"

        [Required]
        public required string DosageForm { get; set; } // e.g., "Tablet", "Capsule", "ml"

        [Required]
        public required string Quantity { get; set; } // e.g., "14 tablets", "1 bottle (100ml)"

        [Required]
        // SIG: "Signa in Latin", the instructions for the patient.
        public required string Directions { get; set; } // e.g., "Take 1 tablet by mouth twice daily for 7 days"
        
        public string? Notes { get; set; } // Optional notes for the pharmacist or patient, e.g., "Take with food"
    }

    // The main DTO for creating a prescription
    public class CreatePrescriptionDto
    {
        [Required]
        public int RecordId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "A prescription must contain at least one medication.")]
        public List<PrescribedMedicationDto> Medications { get; set; } = [];

        // General notes for the entire prescription, if any.
        public string? GeneralInstructions { get; set; } 
    }
}
