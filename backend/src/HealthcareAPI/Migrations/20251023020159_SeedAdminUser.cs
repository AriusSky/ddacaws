using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthcareAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Address", "CreatedAt", "DateOfBirth", "Email", "FullName", "Gender", "IsActive", "PasswordHash", "PhoneNumber", "ProfileImage", "Role", "UpdatedAt" },
                values: new object[] { 1, null, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), null, "admin@healthcare.com", "Admin User", null, true, "$2a$11$1sLz.i3pS9Wd.i3Nf2iOJO/P3l.P2uA9y8zJ.b5U6i1g/H6uT7w8W", null, null, 2, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1);
        }
    }
}
