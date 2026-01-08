using Amazon.DynamoDBv2;
using Amazon.Runtime;
using Amazon.S3;
using HealthcareAPI.Data;
using HealthcareAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Development.json", optional: false, reloadOnChange: true);
}


// --- 1. Register Services for Dependency Injection ---

// Add DbContext for Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add our custom TokenService
builder.Services.AddScoped<TokenService>();

builder.Services.AddScoped<S3Service>();
builder.Services.AddScoped<GeminiService>();

// Add services for Controllers and API documentation
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Manually configure the S3 client (most stable!).
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = builder.Configuration;
    var credentials = new BasicAWSCredentials(
        config["AWS:AccessKey"],
        config["AWS:SecretKey"]
    );
    var s3Config = new AmazonS3Config
    {
        RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(config["AWS:Region"])
    };
    return new AmazonS3Client(credentials, s3Config);
});

// Gemini AI module
builder.Services.AddHttpClient<GeminiService>();
builder.Services.AddScoped<GeminiService>();


builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions("AWS"));
//builder.Services.AddAWSService<IAmazonDynamoDB>();
Console.WriteLine("AWS KEY = " + builder.Configuration["AWS:AccessKey"]);

builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
{
    var config = builder.Configuration;

    var credentials = new BasicAWSCredentials(
        config["AWS:AccessKey"],
        config["AWS:SecretKey"]
    );

    var dynamoConfig = new AmazonDynamoDBConfig
    {
        RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(config["AWS:Region"])
    };

    return new AmazonDynamoDBClient(credentials, dynamoConfig);
});



// Blockchain part
builder.Services.AddSingleton<HealthcareBlockchain>();
//builder.Services.AddScoped<HealthRecordBlockchainService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // 1. Define the security scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\""
    });

    // 2. Add a security requirement
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// --- 2. Configure JWT Authentication ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:80")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});


// --- Build the Application ---
var app = builder.Build();

// --- 4. Configure the HTTP request pipeline (Middleware) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

// app.UseHttpsRedirection();

// Use CORS middleware BEFORE authentication
app.UseCors("AllowFrontend");

// IMPORTANT: These two must be in this order
app.UseAuthentication(); // First, who are you?
app.UseAuthorization();  // Then, are you allowed to do that?

app.MapControllers();

// Configure S3 CORS on startup
using (var scope = app.Services.CreateScope())
{
    var s3Client = scope.ServiceProvider.GetRequiredService<IAmazonS3>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var bucketName = config["BucketName"];
    
    try
    {
        var corsConfig = new Amazon.S3.Model.CORSConfiguration
        {
            Rules = new List<Amazon.S3.Model.CORSRule>
            {
                new Amazon.S3.Model.CORSRule
                {
                    AllowedMethods = new List<string> { "GET", "PUT", "POST", "DELETE", "HEAD" },
                    AllowedOrigins = new List<string> { "http://localhost:5173", "http://localhost:3000", "*" },
                    AllowedHeaders = new List<string> { "*" },
                    ExposeHeaders = new List<string> { "ETag", "x-amz-version-id" },
                    MaxAgeSeconds = 3000
                }
            }
        };
        
        await s3Client.PutCORSConfigurationAsync(bucketName, corsConfig);
        Console.WriteLine($"S3 CORS configured for bucket: {bucketName}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to configure S3 CORS: {ex.Message}");
    }
}

app.Run();
