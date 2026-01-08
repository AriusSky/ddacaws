namespace HealthcareAPI.Models.DTOs
{
    public class MedicalRecordDto
    {
        public int RecordId { get; set; }
        public int AppointmentId { get; set; }
        public DateTime RecordDate { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public required string Diagnosis { get; set; }
        public string? BlockchainHash { get; set; }
    }
}
