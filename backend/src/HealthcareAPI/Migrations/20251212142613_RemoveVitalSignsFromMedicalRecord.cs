using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthcareAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveVitalSignsFromMedicalRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VitalSigns",
                table: "MedicalRecords");

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "DoctorId",
                keyValue: 99,
                column: "Biography",
                value: "Dr. Wong is a leading expert in cardiovascular health with over 15 years of experience.");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VitalSigns",
                table: "MedicalRecords",
                type: "jsonb",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "DoctorId",
                keyValue: 99,
                column: "Biography",
                value: "Dr. Wong is a leading expert in cardiovascular health.");
        }
    }
}
