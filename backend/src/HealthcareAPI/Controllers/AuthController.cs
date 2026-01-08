using HealthcareAPI.Data;
using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;
using HealthcareAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Amazon.S3;
using Amazon.S3.Model;

namespace HealthcareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // -> results in "api/auth"
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly IAmazonS3 _s3Client;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, TokenService tokenService, IAmazonS3 s3Client, IConfiguration config)
        {
            _context = context;
            _tokenService = tokenService;
            _s3Client = s3Client;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email.ToLower()))
            {
                return BadRequest(new { message = "Email is already taken." });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Ensure DateOfBirth is UTC if provided
                DateTime? dateOfBirth = null;
                if (registerDto.DateOfBirth.HasValue)
                {
                    dateOfBirth = DateTime.SpecifyKind(registerDto.DateOfBirth.Value, DateTimeKind.Utc);
                }

                var user = new User
                {
                    FullName = registerDto.FullName,
                    Email = registerDto.Email.ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    PhoneNumber = registerDto.PhoneNumber,
                    DateOfBirth = dateOfBirth,
                    Gender = registerDto.Gender,
                    Address = registerDto.Address,
                    Role = UserRole.Patient,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Explicitly commit the transaction. This forces the write to the database NOW.
                await transaction.CommitAsync();

                return Ok(new 
                { 
                    message = "User registered successfully.",
                    userId = user.UserId,
                    email = user.Email,
                    fullName = user.FullName
                });
            }
            catch (Exception ex)
            {
                // If anything goes wrong, guarantee a rollback.
                await transaction.RollbackAsync();
                // Log the exception here for debugging
                Console.WriteLine($"Registration error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"An internal error occurred during registration: {ex.InnerException?.Message ?? ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            try
            {
                Console.WriteLine($"[LOGIN] Received login request for email: {loginDto.Email}");
                
                // Find the user by email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email.ToLower());

                // Check if user exists
                if (user == null)
                {
                    Console.WriteLine($"[LOGIN] User not found for email: {loginDto.Email}");
                    return Unauthorized(new { message = "Invalid credentials." });
                }

                Console.WriteLine($"[LOGIN] User found: {user.Email}, UserId: {user.UserId}");
                Console.WriteLine($"[LOGIN] Stored PasswordHash: {user.PasswordHash.Substring(0, 20)}...");
                Console.WriteLine($"[LOGIN] Attempting to verify password...");

                // Check if password is correct
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
                Console.WriteLine($"[LOGIN] Password verification result: {isPasswordValid}");

                if (!isPasswordValid)
                {
                    Console.WriteLine($"[LOGIN] Password verification failed");
                    return Unauthorized(new { message = "Invalid credentials." });
                }

                Console.WriteLine($"[LOGIN] Password verified successfully, creating token...");

                // If credentials are valid, create a token
                var token = _tokenService.CreateToken(user);

                Console.WriteLine($"[LOGIN] Token created successfully");

                // Return the token and user info to the client
                return Ok(new
                {
                    message = "Login successful",
                    token = token,
                    user = new
                    {
                        userId = user.UserId,
                        fullName = user.FullName,
                        email = user.Email,
                        role = user.Role.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LOGIN] Exception occurred: {ex.Message}");
                Console.WriteLine($"[LOGIN] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"An error occurred during login: {ex.Message}" });
            }
        }
        // GET: api/auth/profile
        [HttpGet("profile")]
        [Authorize] // Requires a valid token
        public async Task<ActionResult<ProfileDto>> GetProfile()
        {
            // Get user ID from the JWT token's claims
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var profileDto = new ProfileDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Address = user.Address,
                AvatarUrl = user.ProfileImage,
                Role = user.Role.ToString()
            };

            return Ok(profileDto);
        }

        // GET: api/auth/doctor-profile (for logged-in doctors)
        [HttpGet("doctor-profile")]
        [Authorize]
        public async Task<ActionResult<dynamic>> GetDoctorProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor == null)
            {
                return NotFound("Doctor profile not found.");
            }

            return Ok(new
            {
                doctorId = doctor.DoctorId,
                userId = doctor.UserId,
                specialization = doctor.Specialization,
                licenseNumber = doctor.LicenseNumber,
                yearsOfExperience = doctor.YearsOfExperience,
                bio = doctor.Biography,
                consultationFee = doctor.ConsultationFee,
                profile = new
                {
                    userId = doctor.User.UserId,
                    email = doctor.User.Email,
                    fullName = doctor.User.FullName,
                    phoneNumber = doctor.User.PhoneNumber,
                    dateOfBirth = doctor.User.DateOfBirth,
                    gender = doctor.User.Gender,
                    address = doctor.User.Address,
                    avatarUrl = doctor.User.ProfileImage,
                    role = doctor.User.Role.ToString()
                }
            });
        }

        // PUT: api/auth/profile
        [HttpPut("profile")]
        [Authorize] // Requires a valid token
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto updateProfileDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    // This case should be rare if the token is valid, but it's a good safety check
                    return NotFound("User not found.");
                }

                // Update the user's properties from the DTO
                user.FullName = updateProfileDto.FullName;
                user.PhoneNumber = updateProfileDto.PhoneNumber;
                user.DateOfBirth = updateProfileDto.DateOfBirth;
                user.Gender = updateProfileDto.Gender;
                user.Address = updateProfileDto.Address;
                if (!string.IsNullOrEmpty(updateProfileDto.ProfileImageUrl))
                {
                    user.ProfileImage = updateProfileDto.ProfileImageUrl;
                }
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPDATE-PROFILE-ERROR] {ex.Message}");
                Console.WriteLine($"[UPDATE-PROFILE-ERROR] {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while updating the profile.", error = ex.Message });
            }
        }

        // POST: api/auth/upload-picture
        [HttpPost("upload-picture")]
        [Authorize] // Requires authentication
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var bucketName = _config["BucketName"];
            
            if (string.IsNullOrEmpty(bucketName))
                return BadRequest("BucketName not configured!");

            // Store in avatars folder with user ID for easy organization
            var key = $"avatars/{userId}/{Guid.NewGuid()}_{file.FileName}";

            using var stream = file.OpenReadStream();
            var request = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };

            await _s3Client.PutObjectAsync(request);

            // Generate a signed URL valid for 365 days for profile pictures
            var urlRequest = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddDays(365)
            };
            var signedUrl = _s3Client.GetPreSignedURL(urlRequest);

            return Ok(new { fileUrl = signedUrl, fileKey = key });
        }
    }
}
