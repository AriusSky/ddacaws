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
    [Route("api/prescriptions")]
    [Authorize]
    public class PrescriptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly HealthcareBlockchain _blockchain;

        public PrescriptionsController(ApplicationDbContext context, HealthcareBlockchain blockchain)
        {
            _context = context;
            _blockchain = blockchain;
        }

        // POST: api/prescriptions
        [HttpPost]
        [Authorize(Roles = nameof(UserRole.Doctor))]
        public async Task<ActionResult<PrescriptionDetailDto>> CreatePrescription(CreatePrescriptionDto createDto)
        {
            var doctorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId);
            if (doctorProfile == null) return Forbid("User is not a registered doctor.");

            var medicalRecord = await _context.MedicalRecords
                .FirstOrDefaultAsync(mr => mr.RecordId == createDto.RecordId);
            if (medicalRecord == null) return NotFound("Medical record not found.");

            // Security Check: Doctor must be the one who wrote the medical record.
            if (medicalRecord.DoctorId != doctorProfile.DoctorId)
            {
                return Forbid("You can only issue prescriptions for your own medical records.");
            }

            var newPrescription = new Prescription
            {
                RecordId = createDto.RecordId,
                PatientId = medicalRecord.PatientId,
                DoctorId = medicalRecord.DoctorId,
                Medications = JsonSerializer.Serialize(createDto.Medications),
                GeneralInstructions = createDto.GeneralInstructions,
                IssueDate = DateTime.UtcNow
            };

            _context.Prescriptions.Add(newPrescription);
            await _context.SaveChangesAsync();

            var block = await _blockchain.AddRecordAsync(
                newPrescription.PatientId.ToString(),
                "Prescription_Create",
                PrescriptionMapper.ToHashingModel(newPrescription)
            );

            newPrescription.BlockchainHash = block.Hash;
            await _context.SaveChangesAsync();


            var createdPrescription = await _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .FirstAsync(p => p.PrescriptionId == newPrescription.PrescriptionId);

            var prescriptionDto = PrescriptionMapper.ToDetailedDto(createdPrescription);

            return CreatedAtAction(nameof(GetPrescriptionById), new { id = createdPrescription.PrescriptionId }, prescriptionDto);
        }

        // GET: api/prescriptions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PrescriptionDetailDto>>> GetPrescriptions([FromQuery] int? patientId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var query = _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .Include(p => p.MedicalRecord)
                .AsQueryable();

            if (userRole == nameof(UserRole.Patient))
            {
                query = query.Where(p => p.PatientId == userId);
            }
            else if (userRole == nameof(UserRole.Doctor))
            {
                // A doctor can either view all prescriptions they've issued,
                // OR view all prescriptions for a specific patient.
                var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctorProfile == null)
                {
                    return Forbid("User does not have a doctor profile.");
                }

                if (patientId.HasValue)
                {
                    // Scenario: Doctor is viewing a specific patient's prescription history.
                    // Security check is implicitly handled as they can only see their patients.
                    query = query.Where(p => p.PatientId == patientId.Value && p.DoctorId == doctorProfile.DoctorId);
                }
                else
                {
                    // Scenario: Doctor is viewing all prescriptions they have issued.
                    query = query.Where(p => p.DoctorId == doctorProfile.DoctorId);
                }
            }
            // Admins will see all prescriptions if no filter is applied.

            var prescriptions = await query
                .OrderByDescending(p => p.IssueDate)
                .ToListAsync();

            var prescriptionDtos = prescriptions.Select(p => PrescriptionMapper.ToDetailedDto(p)).ToList();

            return Ok(prescriptionDtos);
        }

        // GET: api/prescriptions/1
        [HttpGet("{id}")]
        public async Task<ActionResult<PrescriptionDetailDto>> GetPrescriptionById(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var prescription = await _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(p => p.PrescriptionId == id);

            if (prescription == null) return NotFound();

            // Security Check
            var doctorProfile = userRole == nameof(UserRole.Doctor) ? await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId) : null;
            bool isAuthorized = (userRole == nameof(UserRole.Patient) && prescription.PatientId == userId) ||
                                (doctorProfile != null && prescription.DoctorId == doctorProfile.DoctorId);

            if (!isAuthorized) return Forbid("You are not authorized to view this prescription.");

            var prescriptionDto = PrescriptionMapper.ToDetailedDto(prescription);

            return Ok(prescriptionDto);
        }
    }
}
