using HealthcareAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HealthcareAPI.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly GeminiService _gemini;

        public AIController(GeminiService gemini)
        {
            _gemini = gemini;
        }

        // === FROM 'main' & 'wl' ===
        // 1. Analyze Symptoms (No Auth)
        [HttpPost("analyze-symptoms")]
        public async Task<IActionResult> AnalyzeSymptoms([FromBody] SymptomRequest request)
        {
            // The prompt from both branches is good. We'll keep it.
            var prompt = $@"
            You are a medical AI assistant. 
            Analyze these symptoms: {request.Symptoms}
            Respond in JSON:
            {{
                ""recommendedSpecialty"": """",
                ""possibleConditions"": [],
                ""urgency"": ""Low/Medium/High""
            }}";

            var raw = await _gemini.GenerateText(prompt);
            return ReturnCleanJson(raw);
        }

        // === SYNTHESIZED: PROMPT FROM 'main', LOGIC FROM 'wl' ===
        // 2. Identify Medicine (Auth Required)
        [HttpPost("identify-medicine")]
        [Authorize]
        public async Task<IActionResult> IdentifyMedicine([FromBody] ImageRequest request)
        {
            // Use the detailed prompt from the 'main' branch for a better explanation.
            var prompt = "Identify this medicine from the image. Return JSON: { medicineName, usage, precautions }";
            
            // Use the robust base64 handling from the 'wl' branch.
            var base64 = request.ImageBase64.Contains(',') ? request.ImageBase64.Split(',')[1] : request.ImageBase64;
            
            var raw = await _gemini.AnalyzeImage(base64, prompt);
            return ReturnCleanJson(raw);
        }

        // === FROM 'main' & 'wl' ===
        // 3. Interpret Report (Auth Required)
        [HttpPost("interpret-report")]
        [Authorize]
        public async Task<IActionResult> InterpretReport([FromBody] ReportRequest request)
        {
            // The prompt from both branches is good. We'll keep it.
            var prompt = $@"
            Interpret this medical report:
            {request.ReportText}
            Return JSON:
            {{
                ""summary"": """",
                ""abnormalItems"": [],
                ""recommendations"": """"
            }}";

            var raw = await _gemini.GenerateText(prompt);
            return ReturnCleanJson(raw);
        }

        // === FROM 'wl' (NEW FEATURE) ===
        // 4. Get Similar Cases (Auth Required)
        [HttpPost("similar-cases")]
        [Authorize]
        public async Task<IActionResult> GetSimilarCases([FromBody] SymptomRequest request)
        {
            var prompt = $@"
            Based on these symptoms: {request.Symptoms}
            Find and recommend similar medical cases with treatment outcomes.
            Return JSON array:
            [
                {{
                    ""id"": ""CASE-001"",
                    ""summary"": ""Brief description of similar case and treatment response""
                }}
            ]
            Provide at least 2-3 relevant case recommendations based on medical literature.";

            var raw = await _gemini.GenerateText(prompt);
            // Use the array parser from 'wl'
            return ReturnCleanJsonArray(raw); 
        }

        // === FROM 'wl' (NEW FEATURE) ===
        // 5. Get Medication Suggestions (Auth Required)
        [HttpPost("medication-suggestions")]
        [Authorize]
        public async Task<IActionResult> GetMedicationSuggestions([FromBody] DiagnosisRequest request)
        {
            var prompt = $@"
            For the diagnosis: {request.Diagnosis}
            Suggest appropriate medications with clinical notes.
            Return JSON array:
            [
                {{
                    ""drug"": ""Drug Name"",
                    ""note"": ""Clinical notes and usage information""
                }}
            ]
            Include first-line treatments and alternatives. Provide 3-5 suggestions.";

            var raw = await _gemini.GenerateText(prompt);
            // Use the array parser from 'wl'
            return ReturnCleanJsonArray(raw);
        }

        // === FROM 'wl' (NEW FEATURE) ===
        // 6. Check Drug Interactions (Auth Required)
        [HttpPost("drug-interactions")]
        [Authorize]
        public async Task<IActionResult> CheckDrugInteractions([FromBody] DrugListRequest request)
        {
            var drugList = string.Join(", ", request.Drugs);
            var prompt = $@"
            Check for drug interactions between: {drugList}
            Return JSON array of interactions:
            [
                {{
                    ""severity"": ""High/Medium/Low"",
                    ""message"": ""Description of the interaction and clinical significance""
                }}
            ]
            If no interactions found, return an empty array [].";

            var raw = await _gemini.GenerateText(prompt);
            // Use the array parser from 'wl'
            return ReturnCleanJsonArray(raw);
        }

        // === FROM 'wl' (SUPERIOR IMPLEMENTATION) ===
        // Helper for single JSON objects
        private IActionResult ReturnCleanJson(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return Ok(new { error = "AI did not return a response." });

            var cleaned = raw.Trim().Replace("```json", "").Replace("```", "").Trim();

            try
            {
                var obj = JsonSerializer.Deserialize<object>(cleaned);
                return Ok(obj);
            }
            catch
            {
                return Ok(new { rawResult = cleaned });
            }
        }

        // Helper for JSON arrays
        private IActionResult ReturnCleanJsonArray(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return Ok(Array.Empty<object>());

            var cleaned = raw.Trim().Replace("```json", "").Replace("```", "").Trim();

            try
            {
                var array = JsonSerializer.Deserialize<JsonElement>(cleaned);
                return Ok(array.ValueKind == JsonValueKind.Array ? array : new { rawResult = cleaned });
            }
            catch
            {
                return Ok(new { rawResult = cleaned });
            }
        }
    }

    // === ALL DTOS FROM BOTH BRANCHES ===
    public class SymptomRequest { public string Symptoms { get; set; } = ""; }
    public class ImageRequest { public string ImageBase64 { get; set; } = ""; }
    public class ReportRequest { public string ReportText { get; set; } = ""; }
    // New DTOs from 'wl'
    public class DiagnosisRequest { public string Diagnosis { get; set; } = ""; }
    public class DrugListRequest { public List<string> Drugs { get; set; } = new(); }
}
