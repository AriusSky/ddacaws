namespace HealthcareAPI.Models.DTOs
{
    public class AppointmentWithDoctorAndPatientDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string AppointmentDate { get; set; } = string.Empty;
        public string TimeSlot { get; set; } = string.Empty;
        public string? Symptom { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? AiAnalysis { get; set; }
        public string? Notes { get; set; }
        public string? CancellationReason { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;

        public DoctorWithProfileSimpleDto Doctor { get; set; } = null!;
        public PatientSimpleDto Patient { get; set; } = null!;
    }

    public class DoctorWithProfileSimpleDto
    {
        public int DoctorId { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public int YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public decimal ConsultationFee { get; set; }

        public DoctorProfileSimpleDto Profile { get; set; } = null!;
    }

    public class DoctorProfileSimpleDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class PatientSimpleDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
