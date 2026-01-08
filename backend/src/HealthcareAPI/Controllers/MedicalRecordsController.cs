using HealthcareAPI.Data;
using HealthcareAPI.Mappers;
using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;
using HealthcareAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace HealthcareAPI.Controllers
{
    [ApiController]
    [Route("api/medical-records")]
    [Authorize]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly HealthcareBlockchain _blockchain;


        public MedicalRecordsController(ApplicationDbContext context, HealthcareBlockchain blockchain)
        {
            _context = context;
            _blockchain = blockchain;
        }

        // POST: api/medical-records
        [HttpPost]
        [Authorize(Roles = nameof(UserRole.Doctor))]
        public async Task<IActionResult> CreateMedicalRecord(CreateMedicalRecordDto createDto)
        {
            var doctorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId);
            if (doctorProfile == null) return Forbid("User is not a registered doctor.");

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == createDto.AppointmentId);
            if (appointment == null) return NotFound("Appointment not found.");

            // Security Check: Ensure the doctor creating the record is the one from the appointment
            if (appointment.DoctorId != doctorProfile.DoctorId)
            {
                return Forbid("You can only create records for your own appointments.");
            }

            // Business Logic: You can only create a record for a CONFIRMED or COMPLETED appointment.
            if (appointment.Status != AppointmentStatus.Confirmed && appointment.Status != AppointmentStatus.Completed)
            {
                return BadRequest("A medical record can only be created for a confirmed, or completed appointment.");
            }

            // You can also add a check to prevent creating duplicate records for the same appointment.

            var newRecord = new MedicalRecord
            {
                AppointmentId = createDto.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                Diagnosis = createDto.Diagnosis,
                Symptoms = createDto.Symptoms,
                TreatmentPlan = createDto.TreatmentPlan,
                // Serialize the dictionary and list into JSON strings for storing in the database
                Attachments = createDto.Attachments != null ? JsonSerializer.Serialize(createDto.Attachments) : null
                // BlockchainHash will be added later
            };

            _context.MedicalRecords.Add(newRecord);
            await _context.SaveChangesAsync();

            var dataToHash = MedicalRecordMapper.ToHashingModel(newRecord);
            var block = await _blockchain.AddRecordAsync(
                newRecord.PatientId.ToString(),
                "MedicalRecord_Create",
                dataToHash
            );

            newRecord.BlockchainHash = block.Hash;
            await _context.SaveChangesAsync();

            // We can't use the 'newRecord' object directly as its navigation properties (Patient, Doctor) are null.
            var createdRecord = await _context.MedicalRecords
                .Include(mr => mr.Patient)
                .Include(mr => mr.Doctor).ThenInclude(d => d.User)
                .Include(mr => mr.Appointment)
                .FirstAsync(mr => mr.RecordId == newRecord.RecordId);

            var recordDto = MedicalRecordMapper.ToDetailedDto(createdRecord, Url,
                new List<PrescriptionDetailDto>());

            // 201 Created with the full object in the body
            return CreatedAtAction(nameof(GetMedicalRecordById), new { id = newRecord.RecordId }, recordDto);
        }

        // GET: api/medical-records
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMedicalRecords([FromQuery] int? patientId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var query = _context.MedicalRecords
                .Include(mr => mr.Patient)
                .Include(mr => mr.Doctor).ThenInclude(d => d.User)
                .Include(mr => mr.Appointment)
                .AsQueryable();

            if (userRole == nameof(UserRole.Patient))
            {
                // Patients can only see their own records.
                query = query.Where(mr => mr.PatientId == userId);
            }
            else if (userRole == nameof(UserRole.Doctor))
            {
                if (patientId.HasValue)
                {
                    // A doctor is requesting the records for a specific patient.
                    query = query.Where(mr => mr.PatientId == patientId.Value);
                }
                else
                {
                    // A doctor requests their own records (i.e., records they created).
                    var doctorProfile = await _context.Doctors.FirstAsync(d => d.UserId == userId);
                    query = query.Where(mr => mr.DoctorId == doctorProfile.DoctorId);
                }
            }

            var records = await query
                .OrderByDescending(mr => mr.CreatedAt)
                .ToListAsync();

            var detailedRecords = records.Select(record => MedicalRecordMapper.ToDetailedDto(record, Url, new List<PrescriptionDetailDto>())).ToList();

            return Ok(detailedRecords);
        }

        // GET: api/medical-records/1
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMedicalRecordById(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var record = await _context.MedicalRecords
                .Include(mr => mr.Patient)
                .Include(mr => mr.Doctor).ThenInclude(d => d.User)
                .Include(mr => mr.Appointment)
                .FirstOrDefaultAsync(mr => mr.RecordId == id);

            if (record == null)
            {
                return NotFound();
            }

            // Security Check: Only the patient, the doctor involved, or an admin can see the record.
            var doctorProfile = userRole == nameof(UserRole.Doctor) ? await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId) : null;

            bool isAuthorized = userRole == nameof(UserRole.Admin) ||
                                (userRole == nameof(UserRole.Patient) && record.PatientId == userId) ||
                                (doctorProfile != null && record.DoctorId == doctorProfile.DoctorId);

            if (!isAuthorized)
            {
                return Forbid("You are not authorized to view this medical record.");
            }
            var prescriptions = await _context.Prescriptions
                .Where(p => p.RecordId == record.RecordId)
                .ToListAsync();

            // Map the prescriptions to their DTOs
            var prescriptionDtos = prescriptions.Select(p => PrescriptionMapper.ToDetailedDto(p)).ToList();

            var recordDto = MedicalRecordMapper.ToDetailedDto(record, Url, prescriptionDtos);

            return Ok(recordDto);
        }

        // PUT: api/medical-records/1
        [HttpPut("{id}")]
        [Authorize(Roles = nameof(UserRole.Doctor))]
        public async Task<IActionResult> UpdateMedicalRecord(int id, CreateMedicalRecordDto updateDto)
        {
            // For simplicity, we reuse CreateMedicalRecordDto for updates
            var doctorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId);
            if (doctorProfile == null) return Forbid();

            var record = await _context.MedicalRecords
                .Include(mr => mr.Patient)
                .Include(mr => mr.Doctor).ThenInclude(d => d.User)
                .Include(mr => mr.Appointment)
                .FirstOrDefaultAsync(mr => mr.RecordId == id);

            if (record == null) return NotFound();

            // Security Check: Only the doctor who created the record can edit it.
            if (record.DoctorId != doctorProfile.DoctorId)
            {
                return Forbid("You can only update medical records you have created.");
            }

            // Update properties
            record.Diagnosis = updateDto.Diagnosis;
            record.Symptoms = updateDto.Symptoms;
            record.TreatmentPlan = updateDto.TreatmentPlan;
            record.Attachments = updateDto.Attachments != null ? JsonSerializer.Serialize(updateDto.Attachments) : null;
            record.UpdatedAt = DateTime.UtcNow;

            var block = await _blockchain.AddRecordAsync(
                record.PatientId.ToString(),
                "MedicalRecord_Update",
                MedicalRecordMapper.ToHashingModel(record)
            );

            record.BlockchainHash = block.Hash;

            await _context.SaveChangesAsync();

            var recordDto = MedicalRecordMapper.ToDetailedDto(record, 
                Url, new List<PrescriptionDetailDto>());

            // Return a 200 OK with the full, updated object
            return Ok(recordDto);
        }

        // GET: api/medical-records/{id}/pdf
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadRecordPdf(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var record = await _context.MedicalRecords
                .Include(mr => mr.Patient)
                .Include(mr => mr.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(mr => mr.RecordId == id);

            if (record == null)
            {
                return NotFound();
            }

            // Security Check: Only the patient, the doctor involved, or an admin can download the record.
            var doctorProfile = userRole == nameof(UserRole.Doctor) ? await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId) : null;

            bool isAuthorized = userRole == nameof(UserRole.Admin) ||
                                (userRole == nameof(UserRole.Patient) && record.PatientId == userId) ||
                                (doctorProfile != null && record.DoctorId == doctorProfile.DoctorId);

            if (!isAuthorized)
            {
                return Forbid("You are not authorized to download this medical record.");
            }

            // Generate a simple text-based PDF content
            // For a production system, you'd use a proper PDF library like iTextSharp or PdfSharp
            var pdfContent = $@"MEDICAL RECORD
===================================
Record ID: {record.RecordId}
Appointment ID: {record.AppointmentId}

DOCTOR INFORMATION
-----------------------------------
Name: {record.Doctor.User.FullName}
Specialization: {record.Doctor.Specialization}
Email: {record.Doctor.User.Email}

PATIENT INFORMATION
-----------------------------------
Name: {record.Patient.FullName}
Email: {record.Patient.Email}
PhoneNumber: {record.Patient.PhoneNumber}

MEDICAL INFORMATION
-----------------------------------
Diagnosis: {record.Diagnosis}
Symptoms: {record.Symptoms ?? "N/A"}
Treatment Plan: {record.TreatmentPlan ?? "N/A"}

Record Created: {record.CreatedAt:yyyy-MM-dd HH:mm:ss}
Last Updated: {record.UpdatedAt:yyyy-MM-dd HH:mm:ss}
";

            var bytes = System.Text.Encoding.UTF8.GetBytes(pdfContent);
            return File(bytes, "application/pdf", $"medical-record-{id}.pdf");
        }
    }
}
