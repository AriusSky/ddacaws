using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;
using System.Text.Json;

namespace HealthcareAPI.Mappers
{
    public static class PrescriptionMapper
    {
        /// <summary>
        /// Creates a standardized, flat object for consistent hashing.
        /// </summary>
        public static object ToHashingModel(Prescription prescription)
        {
            return new
            {
                prescription.PrescriptionId,
                prescription.RecordId,
                prescription.PatientId,
                prescription.DoctorId,
                prescription.Medications, // The raw JSON string of medications
                prescription.GeneralInstructions,
                prescription.IssueDate
            };
        }
        public static PrescriptionDetailDto ToDetailedDto(Prescription prescription)
        {
            return new PrescriptionDetailDto
            {
                PrescriptionId = prescription.PrescriptionId,
                RecordId = prescription.RecordId,
                PatientName = prescription.Patient.FullName,
                DoctorName = prescription.Doctor.User.FullName,
                IssueDate = prescription.IssueDate,
                // Deserialize the JSON string from the DB into the list of objects
                Medications = JsonSerializer.Deserialize<List<PrescribedMedicationDto>>(prescription.Medications) ?? new List<PrescribedMedicationDto>(),
                GeneralInstructions = prescription.GeneralInstructions,
                BlockchainHash = prescription.BlockchainHash
            };
        }
    }
}
