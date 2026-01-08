using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class RescheduleAppointmentDto
    {
        [Required]
        public DateTime AppointmentDate { get; set; }

        public string? TimeSlot { get; set; }
    }
}
