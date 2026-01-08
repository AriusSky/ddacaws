using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthcareAPI.Models
{

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        [MaxLength(100)]
        public required string FullName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public string? ProfileImage { get; set; } // Will store S3 URL
        public DateTime? DateOfBirth { get; set; }
        
        [MaxLength(10)]
        public string? Gender { get; set; }
        
        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation property for the one-to-one relationship with Doctor
        public Doctor? DoctorProfile { get; set; }
    }
}
