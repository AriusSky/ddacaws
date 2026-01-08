using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class UpdateAppointmentDto
    {
        [Required]
        public DateTime AppointmentDate { get; set; }
        public AppointmentStatus Status { get; set; } 

        [MinLength(10)]
        public required string Symptoms { get; set; }
    }
}
