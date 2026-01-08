using HealthcareAPI.Data;
using HealthcareAPI.Models;
using HealthcareAPI.Models.DTOs;
using HealthcareAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Security.Claims;

namespace HealthcareAPI.Controllers
{
    [Route("api/health-metrics")]
    [ApiController]
    [Authorize]
    public class HealthMetricsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly HealthcareBlockchain _blockchain;

        // A private static list to define valid metric types in one place.
        private static readonly List<string> ValidMetricTypes = typeof(HealthMetric)
            .GetProperties() // Get all public properties of the HealthMetric class
            .Where(p => p.PropertyType == typeof(int) || p.PropertyType == typeof(double) || p.PropertyType == typeof(double?)) // Filter for numeric types
            .Select(p => p.Name.ToLower()) // Get their names in lowercase
            .Except(new[] { "id", "patientid" }) // Exclude non-metric properties
            .ToList();

        // Inject the required blockchain service.
        public HealthMetricsController(ApplicationDbContext context, HealthcareBlockchain blockchain)
        {
            _context = context;
            _blockchain = blockchain;
        }

        [HttpPost]
        [Authorize(Roles = nameof(UserRole.Doctor))]
        public async Task<IActionResult> SaveHealthData([FromBody] CreateHealthMetricDto metricDto)
        {
            try
            {
                if (metricDto == null)
                {
                    return BadRequest(new { message = "Metric data is required." });
                }

                var patientExists = await _context.Users.AnyAsync(u => u.UserId == metricDto.PatientId && u.Role == UserRole.Patient);
                if (!patientExists)
                {
                    return NotFound(new { message = $"Patient with ID {metricDto.PatientId} not found." });
                }

                var metricEntity = new HealthMetric
                {
                    PatientId = metricDto.PatientId,
                    Timestamp = DateTime.UtcNow,
                    HeartRate = metricDto.HeartRate,
                    BloodPressureSystolic = metricDto.BloodPressureSystolic,
                    BloodPressureDiastolic = metricDto.BloodPressureDiastolic,
                    BloodSugar = metricDto.BloodSugar,
                    Weight = metricDto.Weight,
                    Temperature = metricDto.Temperature
                };

                _context.HealthMetrics.Add(metricEntity);
                await _context.SaveChangesAsync();

                // Blockchain call is now guaranteed to exist.
                var block = await _blockchain.AddRecordAsync(
                    metricEntity.PatientId.ToString(),
                    "HealthMetric",
                    metricEntity
                );

                return Ok(new
                {
                    message = "Health data saved and recorded on blockchain.",
                    id = metricEntity.Id,
                    timestamp = metricEntity.Timestamp,
                    blockchain = new { blockIndex = block.Index, blockHash = block.Hash }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SaveHealthData] Error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while saving health data.", error = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = $"{nameof(UserRole.Patient)},{nameof(UserRole.Doctor)}")]
        public async Task<IActionResult> GetHealthData([FromQuery] int days = 30, [FromQuery] string? metricType = null)
        {
            var patientId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var startDate = DateTime.UtcNow.AddDays(-days);

            var query = _context.HealthMetrics
                                .Where(h => h.PatientId == patientId && h.Timestamp >= startDate)
                                .OrderBy(h => h.Timestamp);

            if (string.IsNullOrEmpty(metricType))
            {
                var allData = await query.ToListAsync();
                return Ok(allData);
            }

            // --- FIX 2: Use the centralized list for validation ---
            if (!ValidMetricTypes.Contains(metricType.ToLower()))
            {
                return BadRequest($"Invalid metricType. Use one of: {string.Join(", ", ValidMetricTypes)}");
            }

            var metrics = await query.ToListAsync();
            var data = metrics.Select(h => new
            {
                timestamp = h.Timestamp,
                value = GetMetricValue(h, metricType.ToLower())
            }).ToList();

            return Ok(data);
        }

        private static double? GetMetricValue(HealthMetric h, string metricType)
        {
            // Use reflection to find a property on the HealthMetric class
            // that matches the metricType string (case-insensitive).
            PropertyInfo? property = typeof(HealthMetric).GetProperty(
                metricType,
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance
            );

            // If a property with that name was found...
            if (property != null)
            {
                // ...get its value from the 'h' object.
                object? value = property.GetValue(h);

                // The value could be int, double, or double?. We need to convert it to a double?.
                if (value != null)
                {
                    try
                    {
                        return Convert.ToDouble(value);
                    }
                    catch (FormatException)
                    {
                        // This would happen if a property was a non-numeric type, which is a good safeguard.
                        return null;
                    }
                }
            }

            // If no property was found, or its value was null, return null.
            return null;
        }

        [HttpGet("chart")]
        [Authorize(Roles = nameof(UserRole.Patient))]
        public async Task<IActionResult> GetChartData([FromQuery] int days = 30, [FromQuery] string metricType = "heartrate") // Default to a common metric
        {
            // --- FIX 2: Use the centralized list for validation ---
            if (string.IsNullOrEmpty(metricType) || !ValidMetricTypes.Contains(metricType.ToLower()))
            {
                return BadRequest($"Invalid metricType. Use one of: {string.Join(", ", ValidMetricTypes)}");
            }

            var patientId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var startDate = DateTime.UtcNow.AddDays(-days);

            var patientMetrics = await _context.HealthMetrics
                                               .Where(h => h.PatientId == patientId && h.Timestamp >= startDate)
                                               .OrderBy(h => h.Timestamp)
                                               .ToListAsync();

            if (!patientMetrics.Any())
            {
                return Ok(new { labels = Array.Empty<string>(), data = Array.Empty<double>(), unit = "" });
            }

            var groupedData = patientMetrics
                .GroupBy(h => h.Timestamp.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    AverageValue = g.Average(h => GetMetricValue(h, metricType.ToLower()) ?? 0)
                })
                .ToList();

            var labels = groupedData.Select(r => r.Date.ToString("MM-dd"));
            var data = groupedData.Select(r => Math.Round(r.AverageValue, 2));
            var unit = metricType.ToLower() switch
            {
                "heartrate" => "bpm",
                "bloodpressuresystolic" => "mmHg",
                "bloodpressurediastolic" => "mmHg",
                "bloodsugar" => "mmol/L",
                "weight" => "kg",
                "temperature" => "°C",
                _ => ""
            };

            return Ok(new { labels, data, unit });
        }
    }
}
