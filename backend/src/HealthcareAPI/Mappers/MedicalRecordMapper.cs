using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Web;
using System.IO;
using HealthcareAPI.Constants;
using HealthcareAPI.Utils;

namespace HealthcareAPI.Mappers
{
    public static class MedicalRecordMapper
    {
        /// <summary>
        /// Creates a standardized, flat, anonymous object from a MedicalRecord entity,
        /// specifically for the purpose of consistent hashing on the blockchain.
        /// This object contains NO navigation properties to prevent cycles.
        /// </summary>
        public static object ToHashingModel(MedicalRecord record)
        {
            return new
            {
                record.RecordId,
                record.AppointmentId,
                record.PatientId,
                record.DoctorId,
                record.Diagnosis,
                record.Symptoms,
                record.TreatmentPlan,
                record.Attachments, // Include the raw JSON string
                // We use UpdatedAt if available, otherwise CreatedAt, to capture the latest state.
                Timestamp = record.UpdatedAt > record.CreatedAt ? record.UpdatedAt : record.CreatedAt
            };
        }

        public static MedicalRecordDetailDto ToDetailedDto(MedicalRecord record, IUrlHelper urlHelper, List<PrescriptionDetailDto> prescriptions)
        {
            var attachmentKeys = !string.IsNullOrEmpty(record.Attachments)
                ? JsonSerializer.Deserialize<List<string>>(record.Attachments)
                : new List<string>();

            var attachmentDtos = attachmentKeys?.Select(key => new AttachmentDto
            {
                FileKey = key,
                FileName = FileNameHelper.GetOriginalFileName(key),
                // Use the passed-in urlHelper to generate the link
                DownloadUrl = urlHelper.Link(
                    RouteNames.DownloadFile,
                    new { fileKey = HttpUtility.UrlEncode(key) }
                ) ?? ""
            }).ToList();

            return new MedicalRecordDetailDto
            {
                RecordId = record.RecordId,
                AppointmentId = record.AppointmentId,
                CreatedAt = record.CreatedAt,
                Diagnosis = record.Diagnosis,
                Symptoms = record.Symptoms,
                TreatmentPlan = record.TreatmentPlan,
                Attachments = attachmentDtos,
                BlockchainHash = record.BlockchainHash,
                Doctor = new DoctorSummaryDto
                {
                    DoctorId = record.Doctor.DoctorId,
                    FullName = record.Doctor.User.FullName,
                    Specialization = record.Doctor.Specialization
                },
                Patient = new PatientSummaryDto
                {
                    UserId = record.Patient.UserId,
                    FullName = record.Patient.FullName,
                    Email = record.Patient.Email,
                    PhoneNumber = record.Patient.PhoneNumber
                },
                Appointment = new AppointmentSummaryDto
                {
                    AppointmentId = record.Appointment.AppointmentId,
                    AppointmentDate = record.Appointment.AppointmentDate,
                    Notes = record.Appointment.Notes
                },
                Prescriptions = prescriptions
            };
        }
    }
}
