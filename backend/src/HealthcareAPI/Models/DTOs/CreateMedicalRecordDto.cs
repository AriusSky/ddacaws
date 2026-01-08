using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class CreateMedicalRecordDto
    {
        [Required]
        public int AppointmentId { get; set; }

        [Required]
        public required string Diagnosis { get; set; }

        [Required]
        public string? Symptoms { get; set; }
        [Required]
        public string? TreatmentPlan { get; set; }

        public List<string>? Attachments { get; set; }  // only fileKeys
    }
}
