using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthcareAPI.Models
{
    public enum AppointmentStatus
    {
        Pending,
        Confirmed,
        Completed,
        Cancelled
    }

    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }

        [Required]
        public int PatientId { get; set; }
        public User Patient { get; set; } = null!; // Navigation property to the Patient (User)

        [Required]
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!; // Navigation property to the Doctor

        [Required]
        public DateTime AppointmentDate { get; set; }
        public string? TimeSlot { get; set; } // Store the original time slot string (e.g., "09:00 AM - 09:30 AM")
        public int Duration { get; set; } = 30; // Default 30 minutes

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

        public string? Symptoms { get; set; }
        public string? Notes { get; set; } // Notes from the patient or doctor

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }
}
 