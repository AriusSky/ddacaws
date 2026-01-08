namespace HealthcareAPI.Models.DTOs
{
    public class DoctorWithProfileDto
    {
        public int DoctorId { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string? Biography { get; set; }
        public decimal ConsultationFee { get; set; }
        public int? Rating { get; set; }
        public int? TotalReviews { get; set; }
        public bool IsAvailable { get; set; } = true;

        // Nested profile (User data)
        public DoctorProfileDto Profile { get; set; } = null!;
    }

    public class DoctorProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string UserRole { get; set; } = "Doctor";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
