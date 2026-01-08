namespace HealthcareAPI.Models.DTOs
{
    public class DoctorDto
    {
        public int DoctorId { get; set; }
        public required string FullName { get; set; } // From the User model
        public required string Specialization { get; set; }
        public int YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public decimal ConsultationFee { get; set; }
        public string? ProfileImageUrl { get; set; } // From the User model
    }
}
