using HealthcareAPI.Data;
using HealthcareAPI.Mappers;
using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HealthcareAPI.Controllers
{
    [ApiController]
    [Route("api/appointments")]
    [Authorize] // All actions require login
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppointmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/appointments
        // Endpoint for a Patient to create a new appointment
        [HttpPost]
        [Authorize(Roles = nameof(UserRole.Patient))] // Only patients can book
        public async Task<ActionResult<AppointmentWithDoctorAndPatientDto>> CreateAppointment(CreateAppointmentDto createAppointmentDto)
        {
            // Get the currently logged-in user's ID from the JWT token
            var patientId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Check if the selected doctor exists
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorId == createAppointmentDto.DoctorId);

            if (doctor == null)
            {
                return BadRequest("Invalid Doctor ID.");
            }

            // Basic validation for appointment time
            if (createAppointmentDto.AppointmentDate < DateTime.UtcNow)
            {
                return BadRequest("Cannot book an appointment in the past.");
            }

            // Check if the doctor already has an appointment at this exact time
            var existingAppointment = await _context.Appointments
                .Where(a => a.DoctorId == createAppointmentDto.DoctorId
                    && a.AppointmentDate == createAppointmentDto.AppointmentDate.ToUniversalTime()
                    && a.Status != AppointmentStatus.Cancelled)
                .FirstOrDefaultAsync();

            if (existingAppointment != null)
            {
                return BadRequest("This time slot is already booked. Please select a different time.");
            }

            var patient = await _context.Users.FindAsync(patientId);
            if (patient == null)
            {
                return BadRequest("Patient not found.");
            }

            var newAppointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = createAppointmentDto.DoctorId,
                AppointmentDate = createAppointmentDto.AppointmentDate.ToUniversalTime(), // Store in UTC
                TimeSlot = createAppointmentDto.TimeSlot, // Store the original time slot string
                Symptoms = createAppointmentDto.Symptoms,
                Status = AppointmentStatus.Pending
            };

            _context.Appointments.Add(newAppointment);
            await _context.SaveChangesAsync();

            var createdAppointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstAsync(a => a.AppointmentId == newAppointment.AppointmentId);

            var appointmentDto = AppointmentMapper.ToDetailedDto(createdAppointment);

            return CreatedAtAction(nameof(GetAppointmentById), new { id = createdAppointment.AppointmentId }, appointmentDto);
        }

        // GET: api/appointments
        // This now supports filtering by status, e.g., ?status=Pending
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentWithDoctorAndPatientDto>>> GetAppointments([FromQuery] AppointmentStatus? status)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            // Start with a base query
            var query = await GetBaseAppointmentQueryForUser();

            // Filter based on user role
            if (userRole == nameof(UserRole.Patient))
            {
                query = query.Where(a => a.PatientId == userId);
            }
            else if (userRole == nameof(UserRole.Doctor))
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor != null)
                {
                    query = query.Where(a => a.DoctorId == doctor.DoctorId);
                }
                else
                {
                    return Ok(Enumerable.Empty<AppointmentWithDoctorAndPatientDto>()); // This doctor has no profile, so no appointments
                }
            }

            // Note: If user is Admin, no filter is applied, so they see all appointments.
            // Apply the optional status filter if it's provided in the query string
            if (status.HasValue)
            {
                query = query.Where(a => a.Status == status.Value);
            }

            var appointments = await query
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            var appointmentDtos = appointments.Select(AppointmentMapper.ToDetailedDto).ToList();

            return Ok(appointmentDtos);
        }

        // GET: api/appointments/1
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointmentById(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Security check: Only the patient, the doctor, or an admin can view the appointment.
            bool isAuthorized = userRole == nameof(UserRole.Admin) ||
                                (userRole == nameof(UserRole.Patient) && appointment.PatientId == userId);

            if (!isAuthorized && userRole == nameof(UserRole.Doctor))
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor != null && appointment.DoctorId == doctor.DoctorId)
                {
                    isAuthorized = true;
                }
            }

            if (!isAuthorized)
            {
                return Forbid("You are not authorized to view this appointment.");
            }

            var appointmentDto = AppointmentMapper.ToDetailedDto(appointment);

            return Ok(appointmentDto);
        }

        // GET: /api/appointments/for-medical-records
        [HttpGet("for-medical-records")]
        [Authorize(Roles = nameof(UserRole.Doctor))]
        public async Task<ActionResult<IEnumerable<AppointmentWithDoctorAndPatientDto>>> GetAppointmentsForMedicalRecords()
        {
            // 1. Get the base query, already filtered for the logged-in doctor.
            var query = await GetBaseAppointmentQueryForUser();

            if (query == null)
            {
                return Ok(Enumerable.Empty<object>());
            }

            // A record can be created for appointments that are Confirmed, or Completed 
            var eligibleStatuses = new[] {
               AppointmentStatus.Confirmed, AppointmentStatus.Completed
            };

            var appointments = await query
                .Where(a => eligibleStatuses.Contains(a.Status))
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            var appointmentDtos = appointments.Select(AppointmentMapper.ToDetailedDto).ToList();

            return Ok(appointmentDtos);
        }

        /// <summary>
        /// Creates a base IQueryable<Appointment> that is pre-filtered based on the
        /// logged-in user's role (Patient, Doctor, or Admin).
        /// This avoids duplicating the role-checking logic in every GET endpoint.
        /// </summary>
        private async Task<IQueryable<Appointment>?> GetBaseAppointmentQueryForUser()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            // Start with the full query, including navigation properties needed for filtering/mapping.
            var query = _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .AsQueryable();

            if (userRole == nameof(UserRole.Patient))
            {
                return query.Where(a => a.PatientId == userId);
            }
            else if (userRole == nameof(UserRole.Doctor))
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor != null)
                {
                    return query.Where(a => a.DoctorId == doctor.DoctorId);
                }
                else
                {
                    // If a user with role "Doctor" has no doctor profile, they have no appointments.
                    // Return null to indicate this.
                    return null;
                }
            }

            // If the user is an Admin, return the unfiltered query.
            return query;
        }


        // PUT: api/appointments/1
        [HttpPut("{id}")]
        [Authorize(Roles = $"{nameof(UserRole.Doctor)}")]
        public async Task<ActionResult<AppointmentWithDoctorAndPatientDto>> UpdateAppointment(int id, UpdateAppointmentDto updateDto)
        {
            var patientId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Security check: Make sure the patient is updating their OWN appointment
            if (appointment.PatientId != patientId)
            {
                return Forbid("You can only update your own appointments.");
            }

            if (appointment.Status != AppointmentStatus.Pending
                && appointment.Status != AppointmentStatus.Confirmed)
            {
                return BadRequest("Only pending or confirmed appointments can be updated.");
            }

            appointment.AppointmentDate = updateDto.AppointmentDate.ToUniversalTime();
            appointment.Symptoms = updateDto.Symptoms;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedAppointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstAsync(a => a.AppointmentId == id);

            var appointmentDto = AppointmentMapper.ToDetailedDto(updatedAppointment);

            return Ok(appointmentDto);
        }

        // PUT: api/appointments/1/reschedule (Doctor version)
        [HttpPut("{id}/reschedule")]
        [Authorize(Roles = nameof(UserRole.Doctor))] // Only doctors can reschedule
        public async Task<IActionResult> RescheduleAppointment(int id, RescheduleAppointmentDto rescheduleDto)
        {
            var doctorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Find the doctor profile associated with the logged-in user
            var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId);
            if (doctorProfile == null)
            {
                return Forbid("User is not a registered doctor.");
            }

            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Security check: Ensure the doctor rescheduling the appointment is the one assigned to it
            if (appointment.DoctorId != doctorProfile.DoctorId)
            {
                return Forbid("You are not authorized to reschedule this appointment.");
            }

            if (appointment.Status != AppointmentStatus.Pending && appointment.Status != AppointmentStatus.Confirmed)
            {
                return BadRequest("Only pending or confirmed appointments can be rescheduled.");
            }

            appointment.AppointmentDate = rescheduleDto.AppointmentDate.ToUniversalTime();
            if (!string.IsNullOrEmpty(rescheduleDto.TimeSlot))
            {
                appointment.TimeSlot = rescheduleDto.TimeSlot;
            }
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Return the updated appointment
            var appointmentDto = new AppointmentWithDoctorAndPatientDto
            {
                Id = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
                TimeSlot = appointment.TimeSlot ?? appointment.AppointmentDate.ToString("hh:mm tt"),
                Symptom = appointment.Symptoms,
                Status = appointment.Status.ToString(),
                CreatedAt = appointment.CreatedAt.ToString("O"),
                UpdatedAt = appointment.UpdatedAt.ToString("O"),
                Doctor = null,
                Patient = null
            };

            return Ok(appointmentDto);
        }

        [HttpPut("{id}/confirm")]
        [Authorize(Roles = nameof(UserRole.Doctor))] // Only Doctors can confirm
        public async Task<IActionResult> ConfirmAppointment(int id)
        {
            var doctorUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Find the doctor profile associated with the logged-in user
            var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId);
            if (doctorProfile == null)
            {
                return Forbid("User is not a registered doctor.");
            }

            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Security check: Ensure the doctor confirming the appointment is the one assigned to it
            if (appointment.DoctorId != doctorProfile.DoctorId)
            {
                return Forbid("You are not authorized to confirm this appointment.");
            }

            if (appointment.Status != AppointmentStatus.Pending)
            {
                return BadRequest($"Appointment cannot be confirmed. Current status: {appointment.Status}");
            }

            appointment.Status = AppointmentStatus.Confirmed;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment confirmed successfully." });
        }


        // PUT: api/appointments/1/cancel
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = $"{nameof(UserRole.Patient)},{nameof(UserRole.Doctor)}")] // Both can cancel
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            // Security check: Is the user authorized to cancel THIS appointment?
            bool isAuthorized = false;
            if (userRole == nameof(UserRole.Patient) && appointment.PatientId == userId)
            {
                isAuthorized = true;
            }
            else if (userRole == nameof(UserRole.Doctor))
            {
                var doctorProfile = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctorProfile != null && appointment.DoctorId == doctorProfile.DoctorId)
                {
                    isAuthorized = true;
                }
            }

            if (!isAuthorized)
            {
                return Forbid("You are not authorized to cancel this appointment.");
            }

            if (appointment.Status == AppointmentStatus.Completed || appointment.Status == AppointmentStatus.Cancelled)
            {
                return BadRequest($"Appointment cannot be cancelled. Current status: {appointment.Status}");
            }

            appointment.Status = AppointmentStatus.Cancelled;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment cancelled successfully." });
        }
    }
}
