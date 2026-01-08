using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthcareAPI.Migrations
{
    /// <inheritdoc />
    public partial class RefactorHealthMetricsWithFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""HealthMetrics""
                ALTER COLUMN ""PatientId"" TYPE integer
                USING (""PatientId""::integer);
            ");

            migrationBuilder.CreateIndex(
                name: "IX_HealthMetrics_PatientId",
                table: "HealthMetrics",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_HealthMetrics_Users_PatientId",
                table: "HealthMetrics",
                column: "PatientId",
                principalTable: "Users",
                principalColumn: "UserId");
        }
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HealthMetrics_Users_PatientId",
                table: "HealthMetrics");

            migrationBuilder.DropIndex(
                name: "IX_HealthMetrics_PatientId",
                table: "HealthMetrics");

            migrationBuilder.Sql(@"
                        ALTER TABLE ""HealthMetrics""
                        ALTER COLUMN ""PatientId"" TYPE text;
                    ");
        }
    }
}
