using System.ComponentModel.DataAnnotations;

// ✅ Ensure this namespace matches EXACTLY what AdminController is using
namespace HealthcareAPI.Models.DTOs 
{
    public class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Specialization { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}