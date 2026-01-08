using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthcareAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePrescription_RemoveInstructionsAndDurationDaysAndExpiryDate_AddGeneralInstructions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DurationDays",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Prescriptions");

            migrationBuilder.RenameColumn(
                name: "Instructions",
                table: "Prescriptions",
                newName: "GeneralInstructions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GeneralInstructions",
                table: "Prescriptions",
                newName: "Instructions");

            migrationBuilder.AddColumn<int>(
                name: "DurationDays",
                table: "Prescriptions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Prescriptions",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
