using HealthcareAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthcareAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }

        public DbSet<HealthMetric> HealthMetrics { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the one-to-one relationship between User and Doctor
            modelBuilder.Entity<User>()
                .HasOne(u => u.DoctorProfile)
                .WithOne(d => d.User)
                .HasForeignKey<Doctor>(d => d.UserId);

            // Ensure email is unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany() // A user can have many appointments
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a user if they have appointments

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany() // A doctor can have many appointments
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a doctor if they have appointments
                                                    // A medical record has a one-to-one relationship with an appointment
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(mr => mr.Appointment)
                .WithOne() // No navigation property back from Appointment
                .HasForeignKey<MedicalRecord>(mr => mr.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(mr => mr.Patient)
                .WithMany()
                .HasForeignKey(mr => mr.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(mr => mr.Doctor)
                .WithMany()
                .HasForeignKey(mr => mr.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Prescription>()
                .HasOne(p => p.MedicalRecord)
                .WithMany() // A medical record can have multiple prescriptions
                .HasForeignKey(p => p.RecordId)
                .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<HealthMetric>()
            .HasOne(hm => hm.Patient)
            .WithMany() 
            .HasForeignKey(hm => hm.PatientId)
            .OnDelete(DeleteBehavior.ClientSetNull);

            // --- ADD THIS NEW SEEDING LOGIC ---
            // Seed a user for the doctor
            var doctorUser = new User
            {
                UserId = 99, // Use a high, non-conflicting ID for seeds
                FullName = "Dr. Alice Wong",
                Email = "alice.wong@clinic.com",
                PasswordHash = "$2a$11$pLIqi364ziOpYbJWOE1TB.eIrCnnfYeubR1hlQeMh4TUZKkFhYaee", // A default password
                Role = UserRole.Doctor,
                IsActive = true,
                CreatedAt = new DateTime(2025, 10, 23, 0, 0, 0, DateTimeKind.Utc)
            };

            // Seed the doctor profile
            var doctorProfile = new Doctor
            {
                DoctorId = 99,
                UserId = 99, // Link to the user
                Specialization = "Cardiology",
                YearsOfExperience = 15,
                ConsultationFee = 250.00m,
                Biography = "Dr. Wong is a leading expert in cardiovascular health with over 15 years of experience."
            };
            var adminUser = new User
            {
                UserId = 1, // Use a specific low ID for the admin
                FullName = "Admin User",
                Email = "admin@healthcare.com",
                // Pre-generated hash for "AdminPassword123"
                PasswordHash = "$2a$12$J5L2cMOovfN5kgeGM/2ijOhWf6/TF0sFYb9bgYza5E0ZQW3du1bri",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = new DateTime(2025, 10, 23, 0, 0, 0, DateTimeKind.Utc)
            };
            modelBuilder.Entity<User>().HasData(doctorUser, adminUser);
            modelBuilder.Entity<Doctor>().HasData(doctorProfile);
        }
    }
}
