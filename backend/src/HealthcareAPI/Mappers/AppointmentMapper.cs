using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;

namespace HealthcareAPI.Mappers
{
    public static class AppointmentMapper
    {
        /// <summary>
        /// Maps an Appointment entity to the detailed DTO used by the frontend.
        /// Assumes that the related Patient and Doctor.User navigation properties are already loaded.
        /// </summary>
        public static AppointmentWithDoctorAndPatientDto ToDetailedDto(Appointment appointment)
        {
            if (appointment == null)
            {
                return null; // Or throw an exception, depending on desired behavior
            }

            return new AppointmentWithDoctorAndPatientDto
            {
                Id = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
                TimeSlot = appointment.AppointmentDate.ToString("hh:mm tt"),
                Symptom = appointment.Symptoms,
                Status = appointment.Status.ToString(),
                Notes = appointment.Notes,
                CreatedAt = appointment.CreatedAt.ToString("O"), // ISO 8601 format
                UpdatedAt = appointment.UpdatedAt.ToString("O"),
                
                // Map nested Doctor object
                Doctor = new DoctorWithProfileSimpleDto
                {
                    DoctorId = appointment.Doctor.DoctorId,
                    Specialization = appointment.Doctor.Specialization,
                    YearsOfExperience = appointment.Doctor.YearsOfExperience,
                    Biography = appointment.Doctor.Biography,
                    ConsultationFee = appointment.Doctor.ConsultationFee,
                    Profile = new DoctorProfileSimpleDto
                    {
                        Id = appointment.Doctor.User.UserId,
                        Email = appointment.Doctor.User.Email,
                        FullName = appointment.Doctor.User.FullName,
                        Phone = appointment.Doctor.User.PhoneNumber,
                        AvatarUrl = appointment.Doctor.User.ProfileImage
                    }
                },
                
                // Map nested Patient object
                Patient = new PatientSimpleDto
                {
                    Id = appointment.Patient.UserId,
                    Email = appointment.Patient.Email,
                    FullName = appointment.Patient.FullName,
                    PhoneNumber = appointment.Patient.PhoneNumber,
                    AvatarUrl = appointment.Patient.ProfileImage
                }
            };
        }
    }
}
