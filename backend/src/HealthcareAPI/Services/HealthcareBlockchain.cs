// Services/HealthcareBlockchain.cs
using HealthcareAPI.Models;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Configuration;

namespace HealthcareAPI.Services
{
    public class HealthcareBlockchain
    {
        private readonly IAmazonDynamoDB _dynamoDb; // Added DynamoDB client
        private readonly string _tableName;           // Add a table name variable
        private List<Block> _chain = new();
        private readonly List<string> _pendingTransactions = new();


        // New constructor (now requires dependency injection)
        public HealthcareBlockchain(IAmazonDynamoDB dynamoDb, IConfiguration config)
        {
            _dynamoDb = dynamoDb;
            _tableName = config["DynamoDB:TableName"] ?? "HealthcareBlockchain"; // Read table names from configuration

            // Asynchronous calls must wait in a synchronous environment
            // so that data can be loaded when the service starts.

            // GetAwaiter().GetResult() ensures that table creation and data loading
            // are completed during service initialization.
            CreateTableIfNotExistsAsync().GetAwaiter().GetResult();
            LoadChainFromDynamoAsync().GetAwaiter().GetResult();

            // If the chain is still empty after loading, create the genesis block and save it.
            if (!_chain.Any())
            {
                CreateGenesisBlock();
                // After the genesis block is created, it needs to be saved to the database.
                AddGenesisBlockToDynamoAsync(_chain.Last()).GetAwaiter().GetResult();
            }
        }

        private void CreateGenesisBlock()
        {
            var genesis = new Block
            {
                Index = 0,
                Timestamp = DateTime.UtcNow,
                PatientId = "system",
                RecordType = "genesis",
                DataHash = "0",
                PreviousHash = "0",
                MerkleRoot = "genesis"
            };
            genesis.Mine();
            _chain.Add(genesis);
        }


        //public async Task<Block> AddHealthRecordAsync(string patientId, object recordData) // Become an asynchronous method
        //{
        //    var json = JsonSerializer.Serialize(recordData);
        //    var dataHash = SHA256.HashData(Encoding.UTF8.GetBytes(json))
        //                             .Select(b => b.ToString("x2")).Aggregate((a, b) => a + b);

        //    _pendingTransactions.Add(dataHash);

        //    var previous = _chain.Last();
        //    var block = new Block
        //    {
        //        Index = previous.Index + 1, // Use _chain.Count in memory to determine the next index.
        //        Timestamp = DateTime.UtcNow,
        //        PatientId = patientId,
        //        RecordType = "HealthMetric",
        //        DataHash = dataHash,
        //        PreviousHash = previous.Hash,
        //        MerkleRoot = _pendingTransactions.Count == 1
        //                        ? dataHash
        //                        : BuildMerkleRoot(_pendingTransactions)
        //    };

        //    block.Mine(4);

        //    // Atomic append to DynamoDB
        //    // We use conditional expressions to ensure that the index we write is the latest index,
        //    // preventing conflicts between multiple instances.
        //    var expectedIndex = _chain.Count;
        //    var request = new PutItemRequest
        //    {
        //        TableName = _tableName,
        //        Item = new Dictionary<string, AttributeValue>
        //        {
        //            ["Index"] = new AttributeValue { N = block.Index.ToString() },
        //            ["Hash"] = new AttributeValue { S = block.Hash },
        //            ["Data"] = new AttributeValue { S = JsonSerializer.Serialize(block) }  // Store complete block JSON
        //        },
        //        // Key anti-collision logic: Writes are only allowed if the new Index (block.Index) does not already exist.
        //        ConditionExpression = "attribute_not_exists(#idx)",
        //        ExpressionAttributeNames = new Dictionary<string, string> { { "#idx", "Index" } }
        //    };

        //    try
        //    {
        //        // Attempting to write to DynamoDB
        //        await _dynamoDb.PutItemAsync(request);
        //    }
        //    catch (ConditionalCheckFailedException)
        //    {
        //        // If the condition check fails (meaning another instance has written faster), an exception is thrown.
        //        throw new InvalidOperationException("Concurrency conflict; another block has been inserted. Please reload the chain and try again.");
        //    }

        //    _chain.Add(block); // After successful write, update the local cache.
        //    _pendingTransactions.Clear();


        //    return block;
        //}

        // The method name has been changed (Health has been removed), and a recordType parameter has been added.
        public async Task<Block> AddRecordAsync(string patientId, string recordType, object recordData)
        {
            var json = JsonSerializer.Serialize(recordData);
            var dataHash = SHA256.HashData(Encoding.UTF8.GetBytes(json))
                                    .Select(b => b.ToString("x2")).Aggregate((a, b) => a + b);

            _pendingTransactions.Add(dataHash);

            // Get the previous block
            var previous = _chain.Last();

            var block = new Block
            {
                Index = previous.Index + 1,
                Timestamp = DateTime.UtcNow,
                PatientId = patientId,

                // Key change: Instead of "HealthMetric", the passed-in parameter is used here.
                RecordType = recordType,

                DataHash = dataHash,
                PreviousHash = previous.Hash,
                MerkleRoot = _pendingTransactions.Count == 1
                                ? dataHash
                                : BuildMerkleRoot(_pendingTransactions)
            };

            block.Mine(4);

            // Write to DynamoDB
            var request = new PutItemRequest
            {
                TableName = _tableName,
                Item = new Dictionary<string, AttributeValue>
                {
                    ["Index"] = new AttributeValue { N = block.Index.ToString() },
                    ["Hash"] = new AttributeValue { S = block.Hash },
                    ["Data"] = new AttributeValue { S = JsonSerializer.Serialize(block) }
                },
                ConditionExpression = "attribute_not_exists(#idx)",
                ExpressionAttributeNames = new Dictionary<string, string> { { "#idx", "Index" } }
            };

            try
            {
                await _dynamoDb.PutItemAsync(request);
            }
            catch (ConditionalCheckFailedException)
            {
                throw new InvalidOperationException("Concurrency conflict; please try again.");
            }

            _chain.Add(block);
            _pendingTransactions.Clear();

            return block;
        }


        private string BuildMerkleRoot(List<string> hashes)
        {
            if (hashes.Count == 1) return hashes[0];
            var parents = new List<string>();
            for (int i = 0; i < hashes.Count; i += 2)
            {
                var left = hashes[i];
                var right = i + 1 < hashes.Count ? hashes[i + 1] : left;
                parents.Add(SHA256.HashData(Encoding.UTF8.GetBytes(left + right))
                                  .Select(b => b.ToString("x2")).Aggregate((a, b) => a + b));
            }
            return BuildMerkleRoot(parents);
        }

        public bool VerifyChain()
        {
            for (int i = 1; i < _chain.Count; i++)
            {
                var current = _chain[i];
                var prev = _chain[i - 1];
                if (current.Hash != current.CalculateHash() || current.PreviousHash != prev.Hash)
                    return false;
            }
            return true;
        }

        
        private async Task CreateTableIfNotExistsAsync()
        {
            try
            {
                // Try retrieving the table description; if successful, it means the table already exists.
                await _dynamoDb.DescribeTableAsync(_tableName);
            }
            catch (ResourceNotFoundException)
            {
                // If the table does not exist, create it.
                await _dynamoDb.CreateTableAsync(new CreateTableRequest
                {
                    TableName = _tableName,
                    // Use the Index as the primary key (Hash Key), with data type number (N).
                    KeySchema = new List<KeySchemaElement> { new("Index", KeyType.HASH) },
                    AttributeDefinitions = new List<AttributeDefinition> { new("Index", ScalarAttributeType.N) },
                    // Using a pay-as-you-go billing model is the recommended setting for the free tier.
                    BillingMode = BillingMode.PAY_PER_REQUEST
                });
            }
        }

       
        private async Task LoadChainFromDynamoAsync()
        {
            // Use Scan to scan the entire table (Note: Scan is typically not used in large applications).
            //var response = await _dynamoDb.ScanAsync(new ScanRequest
            //{
            //    TableName = _tableName,
            //    ProjectionExpression = "Data" // Read only the "Data" field from the storage block JSON
            //});

            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _tableName,
                ProjectionExpression = "#D",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                  { "#D", "Data" }
                }
            });


            foreach (var item in response.Items)
            {
                if (item.TryGetValue("Data", out AttributeValue? dataValue))
                {
                    var blockJson = dataValue.S;
                    var block = JsonSerializer.Deserialize<Block>(blockJson);
                    if (block != null) _chain.Add(block);
                }
            }
            // Ensure the blockchain is arranged in index order 
            _chain = _chain.OrderBy(b => b.Index).ToList();
        }

        // Save the genesis block separately(because it doesn't follow the AddHealthRecordAsync logic)
        private async Task AddGenesisBlockToDynamoAsync(Block block)
        {
            // The genesis block index must be 0.
            var request = new PutItemRequest
            {
                TableName = _tableName,
                Item = new Dictionary<string, AttributeValue>
                {
                    ["Index"] = new AttributeValue { N = block.Index.ToString() },
                    ["Hash"] = new AttributeValue { S = block.Hash },
                    ["Data"] = new AttributeValue { S = JsonSerializer.Serialize(block) }
                },
                // Write only if Index=0 does not exist to prevent duplicate creation.
                ConditionExpression = "attribute_not_exists(#idx)",
                ExpressionAttributeNames = new Dictionary<string, string> { { "#idx", "Index" } }
            };
            await _dynamoDb.PutItemAsync(request);
        }



        public IReadOnlyList<Block> Chain => _chain;
        public Block? GetLatestBlock() => _chain.LastOrDefault();
    }
}