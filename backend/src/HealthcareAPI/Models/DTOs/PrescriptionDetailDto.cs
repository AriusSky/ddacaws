namespace HealthcareAPI.Models.DTOs
{
    public class PrescriptionDetailDto
    {
        public int PrescriptionId { get; set; }
        public int RecordId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        
        public List<PrescribedMedicationDto> Medications { get; set; } = []; 
        
        public string? GeneralInstructions { get; set; }
        public string? BlockchainHash { get; set; }
    }
}