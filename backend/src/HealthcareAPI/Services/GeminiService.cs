using System.Text;
using System.Text.Json;

namespace HealthcareAPI.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        // Use the modern URL and model from 'main'
        private const string GeminiBaseUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

        // Use the dependency-injected HttpClient from 'main'
        public GeminiService(IConfiguration configuration, HttpClient httpClient)
        {
            _apiKey = configuration["Gemini:ApiKey"] ?? "";
            _httpClient = httpClient;
        }

        public async Task<string> GenerateText(string prompt)
        {
            // Use the excellent mocking/fallback logic from 'wl'
            if (string.IsNullOrEmpty(_apiKey))
            {
                return MockResponse(prompt);
            }

            // Use the robust try...catch block from 'wl'
            try
            {
                var request = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } }
                };

                var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{GeminiBaseUrl}?key={_apiKey}", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseText = await response.Content.ReadAsStringAsync();
                    // Use the safe parsing logic from 'wl'
                    var jsonDoc = JsonDocument.Parse(responseText);
                    var root = jsonDoc.RootElement;
                    if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0 &&
                        candidates[0].TryGetProperty("content", out var contentObj) &&
                        contentObj.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0 &&
                        parts[0].TryGetProperty("text", out var text))
                    {
                        return text.GetString() ?? "";
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Gemini API Error ({response.StatusCode}): {errorContent}");
                }

                // Fallback to mock response on any failure
                return MockResponse(prompt);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini API error: {ex.Message}");
                return MockResponse(prompt);
            }
        }

        public async Task<string> AnalyzeImage(string base64Image, string prompt)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return MockImageResponse();
            }

            try
            {
                var request = new
                {
                    contents = new[]
                    {
                        new { parts = new object[]
                            {
                                new { text = prompt },
                                new { inline_data = new { mime_type = "image/jpeg", data = base64Image } }
                            }
                        }
                    }
                };
                
                var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{GeminiBaseUrl}?key={_apiKey}", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseText = await response.Content.ReadAsStringAsync();
                    var jsonDoc = JsonDocument.Parse(responseText);
                    var root = jsonDoc.RootElement;
                    if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0 &&
                        candidates[0].TryGetProperty("content", out var contentObj) &&
                        contentObj.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0 &&
                        parts[0].TryGetProperty("text", out var text))
                    {
                        return text.GetString() ?? "";
                    }
                }
                
                return MockImageResponse();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini Image Analysis error: {ex.Message}");
                return MockImageResponse();
            }
        }

        // Keep the excellent mock response methods from 'wl'
        private string MockResponse(string prompt)
        {
            if (prompt.Contains("symptoms", StringComparison.OrdinalIgnoreCase))
            {
                return @"{ ""recommendedSpecialty"": ""General Practice"", ""possibleConditions"": [""Common Cold"", ""Allergies""], ""urgency"": ""Low"" }";
            }
            // Add other mock cases as needed
            return @"{ ""summary"": ""Mock analysis complete."", ""recommendations"": ""Consult a professional."" }";
        }

        private string MockImageResponse()
        {
            return @"{ ""medicineName"": ""Mock Aspirin 500mg"", ""usage"": ""Pain relief"", ""precautions"": ""Consult doctor before use."" }";
        }
    }
}
