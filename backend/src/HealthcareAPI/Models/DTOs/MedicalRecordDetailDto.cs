using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class DoctorSummaryDto
    {
        public int DoctorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
    }

    public class PatientSummaryDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
    }
    public class AppointmentSummaryDto
    {
        public int AppointmentId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class MedicalRecordDetailDto
    {
        [Required]
        public required int RecordId { get; set; }
        [Required]
        public required int AppointmentId { get; set; }
        public DateTime CreatedAt  { get; set; }
        [Required]
        public string? Symptoms { get; set; } 
        [Required]
        public string? Diagnosis { get; set; }
        [Required]
        public string? TreatmentPlan { get; set; }
        public List<AttachmentDto>? Attachments { get; set; }
        public List<PrescriptionDetailDto> Prescriptions { get; set; } = new();
        public required string BlockchainHash { get; set; }

        // nested
        [Required]
        public DoctorSummaryDto Doctor { get; set; } = null!;
        [Required]
        public PatientSummaryDto Patient { get; set; } = null!;
        [Required]
        public AppointmentSummaryDto Appointment { get; set; } = null!;
    }
}
