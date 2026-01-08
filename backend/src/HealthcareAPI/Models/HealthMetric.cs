namespace HealthcareAPI.Models
{
    public class HealthMetric
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public User Patient { get; set; } = null!;
        public DateTime Timestamp { get; set; }
        public int HeartRate { get; set; }
        public int BloodPressureSystolic { get; set; }
        public int BloodPressureDiastolic { get; set; }
        public double BloodSugar { get; set; }
        public double Weight { get; set; }
        public double? Temperature { get; set; }
    }
}
