// Controllers/BlockchainController.cs
using HealthcareAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthcareAPI.Controllers
{
    [Route("api/blockchain")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class BlockchainController : ControllerBase
    {
        private readonly HealthcareBlockchain _blockchain;

        public BlockchainController(HealthcareBlockchain blockchain)
        {
            _blockchain = blockchain;
        }

        [HttpGet("verify")]
        public IActionResult Verify()
        {
            var latest = _blockchain.GetLatestBlock();
            return Ok(new
            {
                isValid = _blockchain.VerifyChain(),
                totalBlocks = _blockchain.Chain.Count,
                lastBlockHash = latest?.Hash,
                timestamp = latest?.Timestamp
            });
        }

        [HttpGet("record/{patientId}")]
       // public IActionResult GetRecordInfo(string patientId, [FromQuery] string type = "HealthMetric")
        public IActionResult GetRecordInfo(string patientId, [FromQuery] string? type = null)
        {
            // debugging
            var allPatientsInChain = _blockchain.Chain
                .Where(b => b.PatientId != null && b.PatientId != "system")
                //.Select(b => b.PatientId)
                .Select(b => new
                {
                    Raw = b.PatientId,
                    Length = b.PatientId.Length,
                    Hex = string.Join(" ", b.PatientId.Select(c => ((int)c).ToString("X4")))
                })
                .Distinct()
                .ToList();

            //Console.WriteLine("[Debugging] All patientIds on the chain have:");
            //allPatientsInChain.ForEach(p => Console.WriteLine("  → " + p));
            //Console.WriteLine("[Debugging] What you requested is:" + patientId);
            // end of debug



            var blocks = _blockchain.Chain
                //.Where(b => b.PatientId == patientId && b.RecordType.Contains(type, StringComparison.OrdinalIgnoreCase))
                .Where(b => b.PatientId != null &&
                    b.PatientId.Trim().Equals(patientId.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    // Modify here: Add the logic "if type is empty, then pass".
                    (string.IsNullOrEmpty(type) || b.RecordType.Contains(type, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            //if (!blocks.Any()) return NotFound("No blockchain record found");

            if (!blocks.Any())
            {
                
                return NotFound(new
                {
                    message = "No blockchain record found",
                    yourRequest = patientId,
                    //yourRequest_Trimmed = patientId.Trim(),
                    //yourRequest_Length = patientId.Length,
                    //chainContainsThesePatientIds = allRaw
                    requestType = type ?? "ALL"
                });
            }

            var latest = blocks.Last();
            return Ok(new
            {
                blockIndex = latest.Index,
                blockHash = latest.Hash,
                dataHash = latest.DataHash,
                timestamp = latest.Timestamp,
                recordType = latest.RecordType,
                matchedPatientId_InChain = latest.PatientId   // check what is being saved
            });
        }
    }
}