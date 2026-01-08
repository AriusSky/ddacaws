using HealthcareAPI.Data;
using HealthcareAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareAPI.Models.DTOs;

namespace HealthcareAPI.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("analytics/appointments")]
        public async Task<IActionResult> GetAppointmentAnalytics()
        {
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);

            var rawData = await _context.Appointments
                .Where(a => a.AppointmentDate >= sevenDaysAgo)
                .GroupBy(a => a.AppointmentDate.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Date, x => x.Count);

            var result = new List<object>();
            for (int i = 0; i < 7; i++)
            {
                var dateToCheck = sevenDaysAgo.AddDays(i);
                result.Add(new 
                { 
                    Name = dateToCheck.ToString("ddd"),
                    Appointments = rawData.TryGetValue(dateToCheck, out var count) ? count : 0
                });
            }
            return Ok(result);
        }

        // GET: api/admin/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalDoctors = await _context.Users.CountAsync(u => u.Role == UserRole.Doctor);
            var totalAppointments = await _context.Appointments.CountAsync();
            var totalMedicalRecords = await _context.MedicalRecords.CountAsync(); // A more relevant stat

            return Ok(new 
            { 
                totalUsers, 
                totalDoctors, 
                totalAppointments, 
                totalMedicalRecords 
            });
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? role, [FromQuery] bool? isActive, [FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role))
            {
                if (Enum.TryParse<UserRole>(role, true, out var roleEnum))
                {
                    query = query.Where(u => u.Role == roleEnum);
                }
                else
                {
                    return BadRequest("Invalid role. Use: Patient, Doctor, Admin");
                }
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var users = await query
                .OrderBy(u => u.UserId)
                .Skip(skip)
                .Take(take)
                .Select(u => new 
                {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();
            
            var totalCount = await query.CountAsync();

            return Ok(new { users, totalCount });
        }
        
        // PUT: api/admin/users/{id}
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            if (!string.IsNullOrEmpty(updateDto.FullName)) user.FullName = updateDto.FullName;
            if (!string.IsNullOrEmpty(updateDto.Email)) user.Email = updateDto.Email;

            if (!string.IsNullOrEmpty(updateDto.Role))
            {
                if (Enum.TryParse<UserRole>(updateDto.Role, true, out var roleEnum))
                {
                    user.Role = roleEnum;
                }
                else
                {
                    return BadRequest("Invalid role specified.");
                }
            }

            if (updateDto.IsActive.HasValue)
            {
                user.IsActive = updateDto.IsActive.Value;
            }
            
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully." });
        }

        // DELETE: api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            // Soft delete is much safer than hard delete.
            user.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deactivated successfully (soft delete)." });
        }
        
        // GET: api/admin/appointments
        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments([FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            var query = _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User);
            
            var appointments = await query
                .OrderByDescending(a => a.AppointmentDate)
                .Skip(skip)
                .Take(take)
                .Select(a => new
                {
                    a.AppointmentId,
                    PatientName = a.Patient.FullName, 
                    DoctorName = a.Doctor.User.FullName,
                    a.AppointmentDate,
                    Status = a.Status.ToString()
                })
                .ToListAsync();
            
            var totalCount = await query.CountAsync();

            return Ok(new { appointments, totalCount });
        }

        // PUT: api/admin/appointments/{id}
        [HttpPut("appointments/{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] UpdateAppointmentDto dto)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null) return NotFound("Appointment not found");
            
            // --- FIX: Use the enum from the DTO directly ---
            appt.AppointmentDate = dto.AppointmentDate.ToUniversalTime();
            appt.Status = dto.Status;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Appointment updated successfully" });
        }
    }
}
