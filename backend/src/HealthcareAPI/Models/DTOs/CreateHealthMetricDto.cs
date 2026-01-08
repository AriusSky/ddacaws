using System.ComponentModel.DataAnnotations;

namespace HealthcareAPI.Models.DTOs
{
    public class CreateHealthMetricDto
    {
        // The doctor will provide the ID of the patient they are recording for.
        [Required(ErrorMessage = "PatientId is required.")]
        public int PatientId { get; set; } 
        
        public int HeartRate { get; set; }
        public int BloodPressureSystolic { get; set; }
        public int BloodPressureDiastolic { get; set; }
        public double BloodSugar { get; set; }
        public double Weight { get; set; }
        public double? Temperature { get; set; }
    }
}
