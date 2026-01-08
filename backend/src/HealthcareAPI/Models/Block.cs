// Models/Block.cs
using System.Text;
using System.Security.Cryptography;
using System.Text.Json;

namespace HealthcareAPI.Models
{
    public class Block
    {
        public int Index { get; set; }
        public DateTime Timestamp { get; set; }
        public string PatientId { get; set; } = "";
        public string RecordType { get; set; } = "";     // HealthMetric / MedicalRecord / Prescription
        public string DataHash { get; set; } = "";       // SHA256 of the raw data
        public string PreviousHash { get; set; } = "";
        public string MerkleRoot { get; set; } = "";
        public int Nonce { get; set; }
        public string Hash { get; set; } = "";

        public string CalculateHash()
        {
            var raw = $"{Index}{Timestamp:o}{PatientId}{RecordType}{DataHash}{PreviousHash}{MerkleRoot}{Nonce}";
            return SHA256.HashData(Encoding.UTF8.GetBytes(raw))
                         .Select(b => b.ToString("x2")).Aggregate((a, b) => a + b);
        }

        public void Mine(int difficulty = 4)
        {
            var target = new string('0', difficulty);
            while (!Hash.StartsWith(target))
            {
                Nonce++;
                Hash = CalculateHash();
            }
        }
    }
}