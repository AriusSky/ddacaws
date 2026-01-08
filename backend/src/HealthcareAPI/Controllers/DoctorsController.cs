using HealthcareAPI.Data;
using HealthcareAPI.Models.DTOs;
using HealthcareAPI.Models; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace HealthcareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // This [Authorize] attribute is the key. It protects ALL endpoints in this controller.
    [Authorize]
    public class DoctorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/doctors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorWithProfileDto>>> GetDoctors()
        {
            // Query the database for doctors
            var doctors = await _context.Doctors
                // Use Include() to load the related User data for each doctor
                .Include(d => d.User)
                // Use Select() to project the data into our DTO
                .Select(d => new DoctorWithProfileDto
                {
                    DoctorId = d.DoctorId,
                    Specialization = d.Specialization,
                    LicenseNumber = d.LicenseNumber,
                    YearsOfExperience = d.YearsOfExperience,
                    Biography = d.Biography,
                    ConsultationFee = d.ConsultationFee,
                    IsAvailable = true,
                    Profile = new DoctorProfileDto
                    {
                        Id = d.User.UserId,
                        Email = d.User.Email,
                        FullName = d.User.FullName,
                        PhoneNumber = d.User.PhoneNumber,
                        AvatarUrl = d.User.ProfileImage,
                        DateOfBirth = d.User.DateOfBirth,
                        Gender = d.User.Gender,
                        Address = d.User.Address,
                        UserRole = d.User.Role.ToString(),
                        CreatedAt = d.User.CreatedAt,
                        UpdatedAt = d.User.UpdatedAt,
                        IsActive = d.User.IsActive
                    }
                })
                .ToListAsync();

            return Ok(doctors);
        }
        // GET: api/doctors/5
        // [AllowAnonymous] overrides the [Authorize] on the class for this specific endpoint
        [HttpGet("{id}")]
        [AllowAnonymous] 
        public async Task<ActionResult<DoctorWithProfileDto>> GetDoctor(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Where(d => d.DoctorId == id)
                .Select(d => new DoctorWithProfileDto
                {
                    DoctorId = d.DoctorId,
                    Specialization = d.Specialization,
                    LicenseNumber = d.LicenseNumber,
                    YearsOfExperience = d.YearsOfExperience,
                    Biography = d.Biography,
                    ConsultationFee = d.ConsultationFee,
                    IsAvailable = true,
                    Profile = new DoctorProfileDto
                    {
                        Id = d.User.UserId,
                        Email = d.User.Email,
                        FullName = d.User.FullName,
                        PhoneNumber = d.User.PhoneNumber,
                        AvatarUrl = d.User.ProfileImage,
                        DateOfBirth = d.User.DateOfBirth,
                        Gender = d.User.Gender,
                        Address = d.User.Address,
                        UserRole = d.User.Role.ToString(),
                        CreatedAt = d.User.CreatedAt,
                        UpdatedAt = d.User.UpdatedAt,
                        IsActive = d.User.IsActive
                    }
                })
                .FirstOrDefaultAsync();

            if (doctor == null)
            {
                return NotFound();
            }

            return Ok(doctor);
        }

        // POST: api/doctors
        // This endpoint is protected and requires the user to have the "Admin" role.
        [HttpPost]
        [Authorize(Roles = nameof(UserRole.Admin))]
        public async Task<ActionResult<DoctorDto>> CreateDoctor(CreateDoctorDto createDoctorDto)
        {
            // Check if a user with this email already exists
            if (await _context.Users.AnyAsync(u => u.Email == createDoctorDto.Email.ToLower()))
            {
                return BadRequest("A user with this email already exists.");
            }

            // Transaction to ensure both User and Doctor are created, or neither are.
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Create the User record
                var newUser = new User
                {
                    FullName = createDoctorDto.FullName,
                    Email = createDoctorDto.Email.ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(createDoctorDto.Password),
                    Role = UserRole.Doctor // Assign the Doctor role
                };
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync(); // Save to get the new UserId

                // 2. Create the Doctor profile record, linking it to the new User
                var newDoctorProfile = new Doctor
                {
                    UserId = newUser.UserId,
                    Specialization = createDoctorDto.Specialization,
                    YearsOfExperience = createDoctorDto.YearsOfExperience,
                    ConsultationFee = createDoctorDto.ConsultationFee,
                    Biography = createDoctorDto.Biography
                };
                _context.Doctors.Add(newDoctorProfile);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                // 3. Create a DTO to return the newly created doctor's details
                var doctorDto = new DoctorDto
                {
                    DoctorId = newDoctorProfile.DoctorId,
                    FullName = newUser.FullName,
                    Specialization = newDoctorProfile.Specialization,
                    YearsOfExperience = newDoctorProfile.YearsOfExperience,
                    Biography = newDoctorProfile.Biography,
                    ConsultationFee = newDoctorProfile.ConsultationFee,
                    ProfileImageUrl = newDoctorProfile.User.ProfileImage
                };

                return CreatedAtAction(nameof(GetDoctor), new { id = newDoctorProfile.DoctorId }, doctorDto);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                // Log the exception here
                return StatusCode(500, "An internal error occurred. Please try again.");
            }
        }

        [HttpPut("{id}")]
        // Allow both Doctors and Admins to access this endpoint.
        // The logic inside will differentiate their permissions.
        [Authorize(Roles = $"{nameof(UserRole.Doctor)},{nameof(UserRole.Admin)}")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] JsonElement payload)
        {
            var doctorProfile = await _context.Doctors
                                            .Include(d => d.User)
                                            .FirstOrDefaultAsync(d => d.DoctorId == id);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role)!;

            // --- Role-Based Logic Starts Here ---
            if (userRole == nameof(UserRole.Doctor))
            {
                // A Doctor is updating.
                // Security Check: They can only update their OWN profile.
                if (id != userId || doctorProfile == null)
                {
                    return Forbid();
                }

                // Deserialize the payload into the Doctor's DTO
                DoctorSelfUpdateDto? updateDto;
                try
                {
                    updateDto = payload.Deserialize<DoctorSelfUpdateDto>(new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (updateDto == null) return BadRequest("Invalid request body.");
                }
                catch (JsonException ex)
                {
                    return BadRequest($"Invalid JSON format: {ex.Message}");
                }

                ApplyDoctorSelfUpdateDoctorProfile(doctorProfile, updateDto);
            }
            else if (userRole == nameof(UserRole.Admin))
            {
                if (doctorProfile == null)
                {
                    return NotFound($"Doctor with ID {id} not found.");
                }

                // An Admin is updating. They can update any doctor's profile.
                AdminUpdateDoctorDto? updateDto;
                try
                {
                    updateDto = payload.Deserialize<AdminUpdateDoctorDto>(new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (updateDto == null) return BadRequest("Invalid request body.");
                }
                catch (JsonException ex)
                {
                    return BadRequest($"Invalid JSON format: {ex.Message}");
                }

                ApplyAdminUpdateDoctorProfile(doctorProfile, updateDto);
            }
            else
            {
                // Should not happen due to [Authorize] attribute, but it's a good safeguard.
                return Forbid();
            }

            doctorProfile.User.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        private void ApplyDoctorSelfUpdateDoctorProfile(Doctor doctorProfile, DoctorSelfUpdateDto updateDto)
        {
            doctorProfile.Specialization = updateDto.Specialization;
            doctorProfile.YearsOfExperience = updateDto.YearsOfExperience;
            doctorProfile.Biography = updateDto.Biography;
            doctorProfile.ConsultationFee = updateDto.ConsultationFee;
            doctorProfile.LicenseNumber = updateDto.LicenseNumber;
        }

        private void ApplyAdminUpdateDoctorProfile(Doctor doctorProfile, AdminUpdateDoctorDto updateDto)
        {
            doctorProfile.User.FullName = updateDto.FullName;
            doctorProfile.User.IsActive = updateDto.IsActive;
            doctorProfile.Specialization = updateDto.Specialization;
            doctorProfile.YearsOfExperience = updateDto.YearsOfExperience;
            doctorProfile.Biography = updateDto.Biography;
            doctorProfile.ConsultationFee = updateDto.ConsultationFee;
        }

        // DELETE: api/doctors/5
        [HttpDelete("{id}")]
        [Authorize(Roles = nameof(UserRole.Admin))]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            // Find the Doctor profile
            var doctorProfile = await _context.Doctors
                                            .Include(d => d.User) // Also get the user record
                                            .FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctorProfile == null)
            {
                return NotFound();
            }

            // Instead of hard deleting, a safer pattern is to "soft delete" by
            // deactivating the user account. This preserves data integrity.
            doctorProfile.User.IsActive = false;
            await _context.SaveChangesAsync();
            
            // If you truly want to delete the records (cascading delete should be configured)
            // you would use the following lines instead:
            // _context.Users.Remove(doctorProfile.User); // This would also delete the doctor profile due to the FK constraint
            // await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/patients (get all patients for the logged-in doctor)
        [HttpGet("/api/patients")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetMyPatients()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Get the doctor record for this user
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            
            if (doctor == null)
            {
                return BadRequest("User is not a doctor");
            }

            // Get all unique patients from appointments with this doctor
            var patients = await _context.Appointments
                .Where(a => a.DoctorId == doctor.DoctorId)
                .Select(a => a.PatientId)
                .Distinct()
                .Join(_context.Users, pId => pId, u => u.UserId, (pId, u) => new 
                {
                    id = u.UserId,
                    fullName = u.FullName,
                    email = u.Email,
                    phoneNumber = u.PhoneNumber,
                    avatarUrl = u.ProfileImage,
                    address = u.Address,
                    gender = u.Gender,
                    dateOfBirth = u.DateOfBirth,
                    role = u.Role
                })
                .ToListAsync();

            return Ok(patients);
        }

        // GET: api/patients/{patientId}/records (get medical records for a patient)
        [HttpGet("/api/patients/{patientId}/records")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetPatientRecords(int patientId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Get the doctor record for this user
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            
            if (doctor == null)
            {
                return BadRequest("User is not a doctor");
            }

            // Get medical records for this patient where this doctor is the treating doctor
            var records = await _context.MedicalRecords
                .Where(m => m.PatientId == patientId && m.DoctorId == doctor.DoctorId)
                .Select(m => new
                {
                    recordId = m.RecordId,
                    appointmentId = m.AppointmentId,
                    patientId = m.PatientId,
                    doctorId = m.DoctorId,
                    diagnosis = m.Diagnosis,
                    createdAt = m.CreatedAt,
                    updatedAt = m.UpdatedAt
                })
                .ToListAsync();

            return Ok(records);
        }

        // GET: api/patients/{patientId}/vitals (get vital records for a patient)
        [HttpGet("/api/patients/{patientId}/vitals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetPatientVitals(int patientId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Get the doctor record for this user
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            
            if (doctor == null)
            {
                return BadRequest("User is not a doctor");
            }

            // Get health metrics for this patient
            var vitals = await _context.HealthMetrics
                .Where(h => h.PatientId == patientId)
                .Select(h => new
                {
                    id = h.Id,
                    patientId = h.PatientId,
                    recordedAt = h.Timestamp,
                    heartRate = h.HeartRate,
                    bloodPressure = $"{h.BloodPressureSystolic}/{h.BloodPressureDiastolic}",
                    temperature = h.Temperature
                })
                .ToListAsync();

            return Ok(vitals);
        }

        // PUT: api/doctors/profile (for logged-in doctors to update their own profile)
        [HttpPut("profile")]
        [Authorize] // Just require authentication, not specific role
        public async Task<IActionResult> UpdateOwnProfile(UpdateDoctorProfileDto updateDoctorProfileDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] Received update for UserId: {userId}");
            Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] ProfileImageUrl: {updateDoctorProfileDto.ProfileImageUrl}");

            // Find the doctor by UserId
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor == null)
            {
                return NotFound("Doctor profile not found.");
            }

            // Update User properties
            if (!string.IsNullOrEmpty(updateDoctorProfileDto.FullName))
            {
                doctor.User.FullName = updateDoctorProfileDto.FullName;
            }

            if (!string.IsNullOrEmpty(updateDoctorProfileDto.PhoneNumber))
            {
                doctor.User.PhoneNumber = updateDoctorProfileDto.PhoneNumber;
            }

            if (!string.IsNullOrEmpty(updateDoctorProfileDto.ProfileImageUrl))
            {
                Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] Setting ProfileImage to: {updateDoctorProfileDto.ProfileImageUrl}");
                doctor.User.ProfileImage = updateDoctorProfileDto.ProfileImageUrl;
            }
            else
            {
                Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] ProfileImageUrl is empty or null");
            }

            doctor.User.DateOfBirth = updateDoctorProfileDto.DateOfBirth;
            doctor.User.Gender = updateDoctorProfileDto.Gender;
            doctor.User.Address = updateDoctorProfileDto.Address;
            doctor.User.UpdatedAt = DateTime.UtcNow;

            // Update Doctor-specific properties
            if (!string.IsNullOrEmpty(updateDoctorProfileDto.Specialization))
            {
                doctor.Specialization = updateDoctorProfileDto.Specialization;
            }

            if (updateDoctorProfileDto.YearsOfExperience.HasValue)
            {
                doctor.YearsOfExperience = updateDoctorProfileDto.YearsOfExperience.Value;
            }

            if (!string.IsNullOrEmpty(updateDoctorProfileDto.Biography))
            {
                doctor.Biography = updateDoctorProfileDto.Biography;
            }

            if (updateDoctorProfileDto.ConsultationFee.HasValue)
            {
                doctor.ConsultationFee = updateDoctorProfileDto.ConsultationFee.Value;
            }

            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] Changes saved successfully");
                Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] ProfileImage after save: {doctor.User.ProfileImage}");
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Console.WriteLine($"[DOCTOR-PROFILE-UPDATE] Error: {ex.Message}");
                return NotFound();
            }

            // Return the updated doctor profile
            var updatedDoctor = new DoctorWithProfileDto
            {
                DoctorId = doctor.DoctorId,
                Specialization = doctor.Specialization,
                LicenseNumber = doctor.LicenseNumber,
                YearsOfExperience = doctor.YearsOfExperience,
                Biography = doctor.Biography,
                ConsultationFee = doctor.ConsultationFee,
                IsAvailable = true,
                Profile = new DoctorProfileDto
                {
                    Id = doctor.User.UserId,
                    Email = doctor.User.Email,
                    FullName = doctor.User.FullName,
                    PhoneNumber = doctor.User.PhoneNumber,
                    AvatarUrl = doctor.User.ProfileImage,
                    DateOfBirth = doctor.User.DateOfBirth,
                    Gender = doctor.User.Gender,
                    Address = doctor.User.Address,
                    UserRole = doctor.User.Role.ToString(),
                    CreatedAt = doctor.User.CreatedAt,
                    UpdatedAt = doctor.User.UpdatedAt,
                    IsActive = doctor.User.IsActive
                }
            };

            return Ok(updatedDoctor);
        }
    }
}
