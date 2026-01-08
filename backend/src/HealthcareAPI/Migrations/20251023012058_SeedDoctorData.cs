using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthcareAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedDoctorData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Address", "CreatedAt", "DateOfBirth", "Email", "FullName", "Gender", "IsActive", "PasswordHash", "PhoneNumber", "ProfileImage", "Role", "UpdatedAt" },
                values: new object[] { 99, null, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), null, "alice.wong@clinic.com", "Dr. Alice Wong", null, true, "$2a$11$pLIqi364ziOpYbJWOE1TB.eIrCnnfYeubR1hlQeMh4TUZKkFhYaee", null, null, 1, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.InsertData(
                table: "Doctors",
                columns: new[] { "DoctorId", "Biography", "ConsultationFee", "LicenseNumber", "Specialization", "UserId", "YearsOfExperience" },
                values: new object[] { 99, "Dr. Wong is a leading expert in cardiovascular health with over 15 years of experience.", 250.00m, null, "Cardiology", 99, 15 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Doctors",
                keyColumn: "DoctorId",
                keyValue: 99);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 99);
        }
    }
}
