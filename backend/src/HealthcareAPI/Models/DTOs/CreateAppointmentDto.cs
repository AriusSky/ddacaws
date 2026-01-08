using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class CreateAppointmentDto
    {
        [Required]
        public int DoctorId { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        public string? TimeSlot { get; set; } // Time slot string (e.g., "09:00 AM - 09:30 AM")

        public string? Symptoms { get; set; }
    }
}
