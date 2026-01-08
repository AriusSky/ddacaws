# 🎯 Healthcare Smart Appointment & Health Monitoring System - Complete Implementation Plan

## 📋 Project Overview

**Project Name**: Healthcare Smart Appointment & Health Monitoring System  
**Course Code**: CT071-3-3-DDAC  
**Project Type**: Web Application (Frontend-Backend Separation Architecture)  
**Development Cycle**: 8 Weeks (Week 6 - Week 14)  
**Team Size**: 1-4 people  
**Budget**: RM 0 (Completely Free Tier Solution)

---

## 🏥 Industry Selection & Problem Statement

### **Selected Industry**: Healthcare Industry

### **Current Industry Challenges**:

1.  **Inefficient Appointment Scheduling**: Traditional phone-based appointments are time-consuming and prone to errors.
2.  **Uneven Distribution of Medical Resources**: Patients struggle to find suitable specialist doctors.
3.  **Disorganized Medical Record Management**: Paper-based records are easily lost, and data security is low.
4.  **Lack of Health Monitoring**: Patients with chronic diseases lack continuous health data tracking.
5.  **High Barrier to Medical Consultation**: Patients with minor symptoms are unsure which department to visit.

### **Our Solution**:

Develop a cloud-based intelligent medical appointment system that integrates advanced technologies such as AI symptom analysis, blockchain for medical record storage, and real-time health monitoring to provide an efficient, secure, and intelligent healthcare service platform.

---

## 🎯 Coursework Requirements Checklist

| Coursework Requirement         | Our Implementation                      | Points      | Status |
| ------------------------------ | --------------------------------------- | ----------- | ------ |
| **Core Requirements**          |                                         |             |        |
| Use ASP.NET for development    | ASP.NET Core 8.0 Web API                | Mandatory   | ✅     |
| Deploy to AWS cloud environment| EC2 + RDS + S3 + CloudFront             | Mandatory   | ✅     |
| Use AWS monitoring tools       | CloudWatch + X-Ray                      | Mandatory   | ✅     |
| Cloud services integration     | 7 AWS Services                          | Mandatory   | ✅     |
| **Task #1 (30 Points)**        |                                         |             |        |
| Frontend Development           | React 18 + TypeScript                   | 10 Points   | ✅     |
| Backend Development            | ASP.NET Core Web API                    | 10 Points   | ✅     |
| Cloud Database                 | AWS RDS PostgreSQL                      | 10 Points   | ✅     |
| **Task #2 (20 Points)**        |                                         |             |        |
| Cloud Service Integration      | S3, Lambda, DynamoDB                    | 10 Points   | ✅     |
| Monitoring Tools               | CloudWatch Dashboard                    | 10 Points   | ✅     |
| **Distinction Bonus Items**    |                                         |             |        |
| AI Integration                 | Google Gemini API (Symptom Analysis)    | +20 Points  | ✅     |
| Blockchain                     | Simple custom blockchain implementation | +15 Points  | ✅     |
| NoSQL Database                 | AWS DynamoDB                            | +10 Points  | ✅     |
| Serverless Architecture        | AWS Lambda Functions                    | +10 Points  | ✅     |
| Vector Database                | PostgreSQL pgvector extension           | +15 Points  | ✅     |
| Advanced Security Measures     | JWT + Data Encryption                   | +10 Points  | ✅     |

**Estimated Total Score**: 50 (Core) + 80 (Bonus) = **100+ Points**  
**Target Grade**: **Distinction (80%+)**

---

## 🛠️ Detailed Technology Stack Specifications

### **1. Frontend - Web Application**

```
Core Framework:
├── React 18.2+ (Latest stable version)
├── TypeScript 5.0+ (Type Safety)
└── Vite (Build tool, faster than create-react-app)

UI Framework:
├── Material-UI (MUI) v5
│   └── Pre-built components to accelerate development
└── Tailwind CSS (Optional, for custom styling)

State Management:
├── React Context API (Global state)
└── TanStack Query (formerly React Query) (Server state caching)

Routing:
└── React Router v6 (Single Page Application routing)

HTTP Client:
└── Axios (API calls)

Charting Library:
└── Recharts (Data visualization)

Other Tools:
├── React-Toastify (Notifications)
├── date-fns (Date manipulation)
└── Formik + Yup (Form validation)
```

### **2. Backend - API Server**

```
Core Framework:
└── ASP.NET Core 8.0 Web API
    ├── Latest LTS version
    ├── Native support for RESTful APIs
    └── High-performance and cross-platform

ORM (Object-Relational Mapping):
└── Entity Framework Core 8.0
    ├── Code-First approach
    ├── Automatic migration management
    └── LINQ for queries

Authentication & Authorization:
├── JWT (JSON Web Tokens)
├── BCrypt.Net (Password hashing)
└── Microsoft.AspNetCore.Authentication.JwtBearer

API Documentation:
└── Swagger/OpenAPI (Auto-generated API docs)

Dependency Injection:
└── ASP.NET Core built-in DI container
```

### **3. Database Architecture**

#### **Primary Database: AWS RDS PostgreSQL 15**

```
Purpose: Relational data persistence
Free Tier: 
├── db.t3.micro instance
├── 20GB storage
└── 750 hours/month run time

Data Stored:
├── User information (Users table)
├── Doctor information (Doctors table)
├── Appointment records (Appointments table)
├── Medical records (MedicalRecords table)
├── Prescription information (Prescriptions table)
└── Symptom vectors (SymptomVectors table - for AI)

Extension:
└── pgvector (Vector database extension)
    └── Used for AI-powered semantic search
```

#### **Auxiliary Database: AWS DynamoDB**

```
Purpose: NoSQL high-speed data storage
Free Tier:
├── 25GB storage (perpetually free)
├── 25 Read/Write Capacity Units
└── 25GB data transfer

Data Stored:
├── Health monitoring data (Heart rate, blood pressure, blood sugar)
│   └── Partition Key: PatientId, Sort Key: Timestamp
├── Session data
│   └── TTL for automatic expiration
└── AI analysis cache
    └── Avoids redundant calls to AI API
```

### **4. Cloud Storage Service**

```
AWS S3 (Simple Storage Service):
├── Frontend static file hosting
│   └── React build artifacts (HTML/CSS/JS)
├── Medical document storage
│   ├── Lab reports (PDF, JPG)
│   ├── Prescriptions
│   └── X-ray/CT scan images
├── Free Tier: 5GB storage + 20,000 GET requests
└── Lifecycle Management (Transition to low-cost S3 Glacier after 30 days)

AWS CloudFront (CDN):
├── Frontend content delivery acceleration
├── Automatic HTTPS certificates
├── Free Tier: 1TB data transfer/month
└── Caching Policy: Cache static assets for 24 hours
```

### **5. Compute Services**

```
AWS EC2 (Backend Hosting):
├── Instance Type: t2.micro (Free Tier)
├── Operating System: Ubuntu 22.04 LTS
├── Configuration: 1 vCPU, 1GB RAM
├── Free Tier: 750 hours/month
└── Security Group Configuration:
    ├── Port 22 (SSH)
    ├── Port 80 (HTTP)
    ├── Port 443 (HTTPS)
    └── Port 5000 (ASP.NET default)

AWS Lambda (Serverless Functions):
├── Automated appointment reminders
│   └── Executes daily at 8 PM
├── Data backup tasks
│   └── Executes every Sunday at 2 AM
├── Free Tier: 1 million requests/month
└── Runtime: .NET 8
```

### **6. AI & Machine Learning Services**

```
Google Gemini API (Free Plan):
├── Models: gemini-pro (text) + gemini-pro-vision (image)
├── Free Tier: 60 requests/minute
├── Feature Implementation:
│   ├── Symptom analysis assistant
│   │   └── Input symptoms → Recommend department + precautions
│   ├── Medication identification
│   │   └── Upload medication image → Identify name and purpose
│   └── Health report interpretation
│       └── Upload lab report → AI interprets abnormal indicators
└── Backup Plan: OpenAI API ($5 free credit)

PostgreSQL pgvector Extension:
├── Vector Dimensions: 1536 (OpenAI embedding standard)
├── Index Type: IVFFlat (Fast approximate search)
├── Functionality: Similar symptom search
└── Workflow:
    ├── Convert symptom descriptions to vectors
    ├── Search for historically similar cases
    └── Assist AI with diagnostic suggestions
```

### **7. Blockchain Implementation**

```
Approach: Custom-built simple blockchain (not using AWS Managed Blockchain)
Reasoning: 
├── AWS Managed Blockchain has no free tier
└── A self-built solution is more suitable for demonstration and learning purposes

Technical Implementation:
├── Language: C# (integrated into the ASP.NET backend)
├── Hashing Algorithm: SHA-256
├── Block Structure:
│   ├── Index
│   ├── Timestamp
│   ├── Data (Medical record data as JSON)
│   ├── PreviousHash
│   └── Hash (Current block's hash)
└── Storage: A dedicated table in PostgreSQL (Blockchain table)

Use Cases:
├── Tamper-proofing medical records
├── Logging prescription issuance on the chain
├── Patient consent records
└── Chain integrity validation function
```

### **8. Monitoring & Analytics Services**

```
AWS CloudWatch:
├── Metrics Monitoring
│   ├── EC2: CPU Utilization, Memory, Disk I/O
│   ├── RDS: Database Connections, Query Latency
│   ├── API: Request latency, error rates
│   └── Custom Metrics: Appointments created, AI calls made
├── Log Management
│   └── CloudWatch Logs (Centralized application log storage)
├── Dashboard
│   └── Real-time monitoring dashboard (4-6 charts)
└── Alarms
    └── Send SNS notification if CPU > 80%

AWS X-Ray (Optional):
├── Distributed tracing
├── Performance bottleneck analysis
└── API call chain visualization

CloudWatch Insights:
└── Log querying and analysis (SQL-like syntax)
```

---

## 🏗️ System Architecture Design

### **Overall Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                           │
│                 https://healthcare-app.com                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│              AWS CloudFront (CDN Global Acceleration)           │
│              ├─ Caches static assets (CSS/JS/Images)             │
│              └─ Automatic HTTPS certificate                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│        AWS S3 Bucket (Frontend Static Hosting)                  │
│        └─ React Build Output (HTML/CSS/JS)                       │
└─────────────────────────────────────────────────────────────────┘

                              ↓ REST API (JSON)
                              ↓ https://api.healthcare-app.com

┌─────────────────────────────────────────────────────────────────┐
│       AWS Application Load Balancer (Optional)                  │
│       └─ HTTPS termination + Load balancing                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              AWS EC2 (t2.micro)                                 │
│              ASP.NET Core 8.0 Web API                           │
│              ├─ Controllers (RESTful API)                        │
│              ├─ Services (Business Logic Layer)                  │
│              │   ├─ AIService (Gemini API calls)                 │
│              │   ├─ BlockchainService (Blockchain logic)         │
│              │   ├─ S3Service (File uploads)                     │
│              │   └─ DynamoDBService (NoSQL operations)           │
│              └─ Entity Framework Core (ORM)                      │
└─────────────────────────────────────────────────────────────────┘
       ↓                    ↓                    ↓
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ AWS RDS      │  │  AWS DynamoDB    │  │   AWS S3         │
│ PostgreSQL   │  │  (NoSQL)         │  │   (File Storage) │
│ + pgvector   │  │  ├─HealthMetrics │  │   ├─Lab Reports   │
│              │  │  ├─Sessions      │  │   ├─Prescriptions │
│ ├─Users      │  │  └─AI Cache      │  │   └─Medical Images│
│ ├─Doctors    │  │                  │  │                  │
│ ├─Appointments│ │                  │  │                  │
│ ├─MedicalRec  │  │                  │  │                  │
│ └─Blockchain  │  │                  │  │                  │
└──────────────┘  └──────────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              AWS Lambda (Serverless Functions)                  │
│              ├─ Appointment Reminder (Triggers daily at 8 PM)    │
│              └─ Data Backup Function (Triggers weekly at 2 AM)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              AWS CloudWatch (Monitoring & Logs)                 │
│              ├─ Metrics (Performance indicators)                 │
│              ├─ Logs (Application logs)                          │
│              ├─ Dashboard (Visual dashboard)                     │
│              └─ Alarms (Alert notifications)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              External API Service                               │
│              └─ Google Gemini API (AI Analysis)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Design (Detailed Table Structure)

### **PostgreSQL Relational Database**

#### **Table 1: Users**

```
Field Name      Data Type       Constraints         Description
UserId          SERIAL          PRIMARY KEY         Auto-incrementing PK
Email           VARCHAR(100)    UNIQUE, NOT NULL    Email address
PasswordHash    VARCHAR(255)    NOT NULL            BCrypt hashed password
FullName        VARCHAR(100)    NOT NULL            Full name
PhoneNumber     VARCHAR(20)                         Phone number
UserRole        VARCHAR(20)     NOT NULL            Role: Patient/Doctor/Admin
ProfileImage    TEXT                                Profile image URL (S3 link)
DateOfBirth     DATE                                Date of birth
Gender          VARCHAR(10)                         Gender
Address         TEXT                                Address
CreatedAt       TIMESTAMP       DEFAULT NOW()       Creation timestamp
UpdatedAt       TIMESTAMP                           Last update timestamp
IsActive        BOOLEAN         DEFAULT TRUE        Account status

Indexes:
├── UNIQUE INDEX idx_email ON Users(Email)
└── INDEX idx_role ON Users(UserRole)
```

#### **Table 2: Doctors**

```
Field Name        Data Type       Constraints         Description
DoctorId          SERIAL          PRIMARY KEY         Auto-incrementing PK
UserId            INTEGER         FOREIGN KEY         References Users table
Specialization    VARCHAR(100)    NOT NULL            Specialty: Cardiology, Pediatrics, etc.
LicenseNumber     VARCHAR(50)     UNIQUE              Medical license number
YearsOfExperience INTEGER                             Years of experience
Biography         TEXT                                Professional biography
ConsultationFee   DECIMAL(10,2)   NOT NULL            Consultation fee (RM)
ClinicAddress     TEXT                                Clinic address
WorkingHours      JSONB                               Working hours (JSON format)
Rating            DECIMAL(3,2)    DEFAULT 0.00        Rating (0-5)
TotalReviews      INTEGER         DEFAULT 0           Number of reviews
IsAvailable       BOOLEAN         DEFAULT TRUE        Accepting new appointments

Foreign Key:
└── FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
```

#### **Table 3: Appointments**

```
Field Name         Data Type       Constraints         Description
AppointmentId      SERIAL          PRIMARY KEY         Auto-incrementing PK
PatientId          INTEGER         FOREIGN KEY         Patient's user ID
DoctorId           INTEGER         FOREIGN KEY         Doctor's ID
AppointmentDate    TIMESTAMP       NOT NULL            Appointment date and time
Duration           INTEGER         DEFAULT 30          Duration in minutes
Status             VARCHAR(20)     NOT NULL            Status: Pending/Confirmed/Completed/Cancelled
Symptoms           TEXT                                Symptom description
AIAnalysisResult   TEXT                                AI analysis result
Notes              TEXT                                Notes
CancellationReason TEXT                                Reason for cancellation
CreatedAt          TIMESTAMP       DEFAULT NOW()       Creation timestamp
UpdatedAt          TIMESTAMP                           Last update timestamp

Foreign Keys:
├── FOREIGN KEY (PatientId) REFERENCES Users(UserId)
└── FOREIGN KEY (DoctorId) REFERENCES Doctors(DoctorId)

Indexes:
├── INDEX idx_patient ON Appointments(PatientId)
├── INDEX idx_doctor ON Appointments(DoctorId)
├── INDEX idx_date ON Appointments(AppointmentDate)
└── INDEX idx_status ON Appointments(Status)
```

#### **Table 4: MedicalRecords**

```
Field Name        Data Type       Constraints         Description
RecordId          SERIAL          PRIMARY KEY         Auto-incrementing PK
AppointmentId     INTEGER         FOREIGN KEY         Associated appointment ID
PatientId         INTEGER         FOREIGN KEY         Patient's user ID
DoctorId          INTEGER         FOREIGN KEY         Doctor's user ID
Diagnosis         TEXT            NOT NULL            Diagnosis result
Symptoms          TEXT                                Recorded symptoms
VitalSigns        JSONB                               Vital signs (JSON format)
LabResults        JSONB                               Lab results
TreatmentPlan     TEXT                                Treatment plan
Notes             TEXT                                Doctor's notes
Attachments       JSONB                               Attachment links (S3 URLs)
BlockchainHash    VARCHAR(64)                         Blockchain hash value
CreatedAt         TIMESTAMP       DEFAULT NOW()       Creation timestamp
UpdatedAt         TIMESTAMP                           Last update timestamp

Foreign Keys:
├── FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId)
├── FOREIGN KEY (PatientId) REFERENCES Users(UserId)
└── FOREIGN KEY (DoctorId) REFERENCES Users(UserId)
```

#### **Table 5: Prescriptions**

```
Field Name        Data Type       Constraints         Description
PrescriptionId    SERIAL          PRIMARY KEY         Auto-incrementing PK
RecordId          INTEGER         FOREIGN KEY         Medical record ID
PatientId         INTEGER         FOREIGN KEY         Patient's user ID
DoctorId          INTEGER         FOREIGN KEY         Doctor's user ID
Medications       JSONB           NOT NULL            List of medications (JSON array)
Dosage            TEXT                                Dosage instructions
Instructions      TEXT                                How to take the medication
Duration          INTEGER                             Duration in days
RefillsAllowed    INTEGER         DEFAULT 0           Number of allowed refills
IssueDate         TIMESTAMP       DEFAULT NOW()       Date issued
ExpiryDate        TIMESTAMP                           Expiration date
BlockchainHash    VARCHAR(64)                         Blockchain hash value
Status            VARCHAR(20)     DEFAULT 'Active'    Status of the prescription

Foreign Keys:
├── FOREIGN KEY (RecordId) REFERENCES MedicalRecords(RecordId)
├── FOREIGN KEY (PatientId) REFERENCES Users(UserId)
└── FOREIGN KEY (DoctorId) REFERENCES Users(UserId)
```

#### **Table 6: SymptomVectors (For AI)**

```
Field Name            Data Type       Constraints         Description
VectorId              SERIAL          PRIMARY KEY         Auto-incrementing PK
SymptomText           TEXT            NOT NULL            Symptom description text
Embedding             VECTOR(1536)    NOT NULL            Vector embedding (pgvector type)
RecommendedSpecialty  VARCHAR(100)                        Recommended specialty
Diagnosis             TEXT                                Common diagnoses
Severity              VARCHAR(20)                         Severity: Mild/Moderate/Severe
CreatedAt             TIMESTAMP       DEFAULT NOW()       Creation timestamp

Index:
└── CREATE INDEX ON SymptomVectors USING ivfflat (Embedding vector_cosine_ops)
   └── For fast vector similarity search
```

#### **Table 7: Blockchain**

```
Field Name        Data Type       Constraints         Description
BlockIndex        SERIAL          PRIMARY KEY         Block index
Timestamp         TIMESTAMP       NOT NULL            Block timestamp
DataType          VARCHAR(50)     NOT NULL            Data type: MedicalRecord/Prescription
ReferenceId       INTEGER         NOT NULL            Associated record ID
DataHash          VARCHAR(64)     NOT NULL            Hash of the data
PreviousHash      VARCHAR(64)     NOT NULL            Hash of the previous block
BlockHash         VARCHAR(64)     NOT NULL            Hash of the current block
CreatedAt         TIMESTAMP       DEFAULT NOW()       Creation timestamp

Indexes:
├── UNIQUE INDEX idx_block_hash ON Blockchain(BlockHash)
└── INDEX idx_reference ON Blockchain(DataType, ReferenceId)
```

### **DynamoDB NoSQL Database**

#### **Table 1: HealthMetrics**

```
Partition Key: PatientId (String)
Sort Key: Timestamp (Number, Unix timestamp)

Attributes:
├── PatientId: String (Partition Key)
├── Timestamp: Number (Sort Key)
├── HeartRate: Number (bpm)
├── BloodPressureSystolic: Number (mmHg)
├── BloodPressureDiastolic: Number (mmHg)
├── BloodSugar: Number (mmol/L)
├── OxygenSaturation: Number (%)
├── Temperature: Number (°C)
├── Weight: Number (kg)
├── DeviceId: String (Device ID)
├── DataSource: String (Source: Manual/IoTDevice/Wearable)
└── Notes: String (Notes)

GSI (Global Secondary Index):
└── DeviceId-Timestamp-index
    ├── Partition Key: DeviceId
    └── Sort Key: Timestamp
    └── Purpose: Query data by device

TTL (Time To Live):
└── Enable on the Timestamp attribute to automatically expire data (e.g., retain for 90 days)
```

#### **Table 2: UserSessions**

```
Partition Key: SessionId (String, UUID)

Attributes:
├── SessionId: String (Primary Key)
├── UserId: Number
├── Token: String (JWT Token)
├── IPAddress: String
├── UserAgent: String (Browser info)
├── LoginTime: Number (Unix timestamp)
├── ExpiryTime: Number (Expiration time)
└── IsActive: Boolean

TTL:
└── Enable on the ExpiryTime attribute (e.g., auto-delete after 24 hours)
```

#### **Table 3: AIAnalysisCache**

```
Partition Key: SymptomsHash (String, MD5 hash)

Attributes:
├── SymptomsHash: String (Primary Key, MD5 of symptom description)
├── OriginalSymptoms: String (Original symptom text)
├── AnalysisResult: String (AI analysis result)
├── RecommendedSpecialty: String (Recommended specialty)
├── Timestamp: Number (Cache timestamp)
└── HitCount: Number (Cache hit count)

TTL:
└── Enable on the Timestamp attribute (e.g., auto-delete after 7 days)
```

---

## 👥 System User Roles and Functions

### **Role 1: Patient**

#### **Core Functions**:

1.  **Account Management**
    *   Register/Login/Logout
    *   Edit personal profile
    *   Change password
    *   Upload profile picture

2.  **Intelligent Consultation**
    *   AI Symptom Analysis Assistant
        *   Input symptom descriptions
        *   AI recommends departments and doctors
        *   Estimates urgency of visit
    *   Medication Identification
        *   Upload pictures of medication
        *   AI identifies the drug's name and purpose

3.  **Appointment Management**
    *   View list of doctors
        *   Filter by specialty
        *   View doctor profiles and ratings
    *   Online Appointment Booking
        *   Select date and time slot
        *   Fill in symptom description
        *   AI automatically analyzes and provides recommendations
    *   View "My Appointments"
        *   Pending/Confirmed/Completed
    *   Cancel appointments

4.  **Health Management**
    *   Record health data
        *   Manually input heart rate, blood pressure, blood sugar
        *   View historical trend charts
    *   View Electronic Medical Records (EMR)
        *   View past consultation records
        *   Download medical records as PDF
        *   Verify record authenticity using blockchain
    *   Prescription Management
        *   View electronic prescriptions
        *   Medication reminders

5.  **Document Management**
    *   Upload lab reports
    *   AI interprets abnormal indicators in reports
    *   View historical documents

### **Role 2: Doctor**

#### **Core Functions**:

1.  **Appointment Management**
    *   View list of pending appointments
    *   Confirm/Reject appointments
    *   View patient's AI analysis results
    *   Reschedule appointments

2.  **Clinical Management**
    *   View patient's historical medical records
    *   Enter diagnosis results
    *   Issue electronic prescriptions
        *   Prescriptions automatically added to the blockchain
    *   Record vital signs
    *   Upload lab reports

3.  **Patient Management**
    *   View "My Patients" list
    *   View patient's health monitoring data
    *   View patient's consultation history

4.  **AI Assistance**
    *   AI-powered similar case recommendations
    *   AI medication suggestions
    *   Drug interaction checks

5.  **Personal Management**
    *   Update personal profile
    *   Set working hours
    *   View income statistics

### **Role 3: Admin**

#### **Core Functions**:

1.  **User Management**
    *   View list of all users
    *   Add/Edit/Delete users
    *   Reset passwords
    *   Manage account status (Enable/Disable)

2.  **Doctor Management**
    *   Review and approve doctor registration applications
    *   Manage doctor profiles
    *   Set consultation fees

3.  **System Monitoring**
    *   View CloudWatch Dashboard
        *   Server performance monitoring
        *   Database connection status
        *   API response times
        *   Error rate statistics
    *   View system logs
    *   Manage alarms

4.  **Data Analytics**
    *   Appointment statistics reports
        *   Daily/Weekly/Monthly statistics
        *   Categorized by specialty
    *   User growth trends
    *   Doctor workload statistics
    *   AI usage frequency analysis

5.  **Blockchain Management**
    *   Check blockchain integrity
    *   Verify that the chain has not been tampered with
    *   View all on-chain records

---
## 📅 8-Week Detailed Development Schedule

---

## **Week 1 (Week 6): Project Planning & Environment Setup**

### **Day 1-2: Requirements Analysis & Document Preparation**

#### **Task List**:

- [ ] Read and fully understand the coursework requirements document
- [ ] Define the project scope and feature list
- [ ] Draw the system architecture diagram (using draw.io or Lucidchart)
- [ ] Design the database ER diagram
- [ ] Create a detailed development plan and timeline
- [ ] Prepare project documentation templates

#### **Output Documents**:

1.  **Project Proposal** (2-3 pages)
    *   Industry problem analysis
    *   Solution overview
    *   Justification for technology stack choices
2.  **System Architecture Diagram** (1 page)
    *   Complete cloud services architecture diagram
    *   Data flow diagram
3.  **Database ER Diagram** (1-2 pages)
    *   Relationships between all tables
    *   Detailed field descriptions

#### **Learning Resources**:

- AWS Official Documentation: https://docs.aws.amazon.com/
- ASP.NET Core Tutorials: https://docs.microsoft.com/aspnet/core/
- React Official Tutorials: https://react.dev/learn

---

### **Day 3-4: AWS Account & Development Environment Setup**

#### **AWS Account Setup**:

```
Step 1: Register for an AWS Account
├── Visit aws.amazon.com
├── Prepare a credit card (for verification only, no charges)
├── Select the Basic Support Plan (Free)
└── ⚠️ Immediately set up a budget alert ($1 USD)

Step 2: Enable Necessary Services
├── EC2 (Compute Service)
├── RDS (Database Service)
├── S3 (Storage Service)
├── DynamoDB (NoSQL Database)
├── Lambda (Serverless)
├── CloudWatch (Monitoring)
└── CloudFront (CDN)

Step 3: Create an IAM User
├── Create an administrator user (do not use the root account)
├── Download the access keys (Access Key + Secret Key)
└── Install the AWS CLI tool
```

#### **Local Development Environment Installation**:

```
For Windows:
1. Visual Studio 2022 Community
   └── Download: https://visualstudio.microsoft.com/downloads/
   └── Install workloads:
       ✅ ASP.NET and web development
       ✅ .NET 8.0 SDK
       ✅ Azure development (includes AWS tools)

2. Node.js 20+ LTS
   └── Download: https://nodejs.org/
   └── Verify: node --version and npm --version

3. Git
   └── Download: https://git-scm.com/downloads
   └── Configure: git config --global user.name "Your Name"

4. VS Code (Optional, for frontend development)
   └── Download: https://code.visualstudio.com/
   └── Extensions:
       ├── ES7+ React/Redux/React-Native snippets
       ├── Prettier - Code formatter
       └── ESLint

5. PostgreSQL Client Tool
   └── pgAdmin 4: https://www.pgadmin.org/download/
   └── or DBeaver: https://dbeaver.io/download/

6. Postman (API Testing)
   └── Download: https://www.postman.com/downloads/

For macOS/Linux:
1. .NET 8.0 SDK
   └── macOS: brew install dotnet
   └── Linux: Refer to Microsoft's official documentation

2. Other tools are the same as for Windows
```

---

### **Day 5-7: Create AWS Resources**

#### **Task 1: Create RDS Database Instance**

```
AWS Console → RDS → Create database

Configuration Parameters:
┌─────────────────────────────────────────┐
│ Engine: PostgreSQL 15.x                 │
│ Templates: Free tier ✅                 │
│ DB instance identifier: healthcare-db   │
│ Master username: postgres               │
│ Master password: [Set a strong password, save it] │
│ DB instance class: db.t3.micro          │
│ Storage type: General Purpose SSD       │
│ Allocated storage: 20 GB                │
│ Public access: Yes (For development phase)│
│ VPC security group: Create new          │
│ Initial database name: healthcaredb     │
└─────────────────────────────────────────┘

Security Group Settings:
├── Type: PostgreSQL
├── Protocol: TCP
├── Port: 5432
└── Source: 0.0.0.0/0 (Allow all IPs for development)
    ⚠️ Restrict to specific IPs in production

Wait time: About 5-10 minutes for creation

Verify Connection:
└── Use pgAdmin or DBeaver to connect
    Host: [RDS-endpoint].rds.amazonaws.com
    Port: 5432
    Database: healthcaredb
    Username: postgres
    Password: [The password you set]
```

#### **Task 2: Create S3 Buckets**

```
AWS Console → S3 → Create bucket

Bucket 1: For Frontend Hosting
┌─────────────────────────────────────────┐
│ Bucket name: healthcare-frontend-[your-student-id] │
│ Region: ap-southeast-1 (Singapore)      │
│ Block Public Access: Uncheck ✅           │
│ Bucket Versioning: Enable               │
│ Server-side encryption: AES-256         │
└─────────────────────────────────────────┘

Configure Static Website Hosting:
├── Properties → Static website hosting
├── Enable ✅
├── Index document: index.html
└── Error document: index.html

Bucket 2: For File Storage
┌─────────────────────────────────────────┐
│ Bucket name: healthcare-files-[your-student-id]    │
│ Region: ap-southeast-1                  │
│ Block Public Access: Partially enabled  │
│ Lifecycle rule: Transition to Glacier after 30 days │
└─────────────────────────────────────────┘
```

#### **Task 3: Create DynamoDB Tables**

```
AWS Console → DynamoDB → Create table

Table 1: HealthMetrics
┌─────────────────────────────────────────┐
│ Table name: HealthMetrics               │
│ Partition key: PatientId (String)       │
│ Sort key: Timestamp (Number)            │
│ Table settings: Default settings        │
│ Read/write capacity: On-demand          │
└─────────────────────────────────────────┘

Table 2: UserSessions
┌─────────────────────────────────────────┐
│ Table name: UserSessions                │
│ Partition key: SessionId (String)       │
│ TTL attribute: ExpiryTime               │
└─────────────────────────────────────────┘

Table 3: AIAnalysisCache
┌─────────────────────────────────────────┐
│ Table name: AIAnalysisCache             │
│ Partition key: SymptomsHash (String)    │
│ TTL attribute: ExpiryTime               │
└─────────────────────────────────────────┘
```

#### **Task 4: Create EC2 Instance**

```
AWS Console → EC2 → Launch Instance

Configuration:
┌─────────────────────────────────────────┐
│ Name: healthcare-api-server             │
│ AMI: Ubuntu Server 22.04 LTS            │
│ Instance type: t2.micro (Free Tier)     │
│ Key pair: Create new key pair and download .pem file │
│ Security group:                         │
│   ├── SSH (22) - My IP                  │
│   ├── HTTP (80) - Anywhere              │
│   ├── HTTPS (443) - Anywhere            │
│   └── Custom TCP (5000) - Anywhere      │
│ Storage: 8 GB gp3                       │
└─────────────────────────────────────────┘

After creation:
└── Record the Public IPv4 address
└── Record the Public IPv4 DNS
```

---

### **Week 1 Deliverables**:

- ✅ Complete project planning document
- ✅ AWS account set up and configured
- ✅ All necessary AWS resources created
- ✅ Local development environment installed
- ✅ Able to connect to the RDS database
- ✅ Able to SSH into the EC2 instance

---

## **Week 2 (Week 7): Backend Foundation Development**

### **Day 1-2: Create ASP.NET Core Project**

#### **Create Project Structure**:

```bash
# Create a solution
dotnet new sln -n HealthcareProject

# Create a Web API project
dotnet new webapi -n HealthcareAPI
dotnet sln add HealthcareAPI/HealthcareAPI.csproj

# Navigate to the project directory
cd HealthcareAPI

# Install NuGet packages
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
dotnet add package BCrypt.Net-Next --version 4.0.3
dotnet add package AWSSDK.S3 --version 3.7.0
dotnet add package AWSSDK.DynamoDBv2 --version 3.7.0
dotnet add package Swashbuckle.AspNetCore --version 6.5.0
dotnet add package Serilog.AspNetCore --version 8.0.0
```

#### **Project Folder Structure**:

```
HealthcareAPI/
├── Controllers/          # API Controllers
├── Models/               # Data Models
│   ├── User.cs
│   ├── Doctor.cs
│   ├── Appointment.cs
│   ├── MedicalRecord.cs
│   ├── Prescription.cs
│   └── DTOs/             # Data Transfer Objects
├── Data/                 # Database Context
│   └── ApplicationDbContext.cs
├── Services/             # Business Logic Services
│   ├── AIService.cs
│   ├── BlockchainService.cs
│   ├── S3Service.cs
│   └── DynamoDBService.cs
├── Middleware/           # Custom Middleware
├── appsettings.json      # Configuration File
└── Program.cs            # Entry Point
```

---

### **Day 3-4: Implement Data Models and Database Context**

#### **Task List**:

- [ ] Create all data model classes (User, Doctor, Appointment, etc.)
- [ ] Create the ApplicationDbContext
- [ ] Configure entity relationships (one-to-one, one-to-many)
- [ ] Configure the connection string in `appsettings.json`
- [ ] Run database migrations
- [ ] Verify that tables have been created

#### **Database Migration Commands**:

```bash
# Create the initial migration
dotnet ef migrations add InitialCreate

# (Optional) View the generated SQL script
dotnet ef migrations script

# Apply the migration to the database
dotnet ef database update

# Verification
# Use pgAdmin to connect to the database and check if the tables were created successfully
```

---

### **Day 5-7: Implement Authentication System**

#### **Task List**:

- [ ] Create an `AuthController` (for Register, Login, Logout)
- [ ] Implement JWT token generation
- [ ] Implement password hashing (BCrypt)
- [ ] Configure JWT authentication middleware
- [ ] Create DTO classes (LoginDTO, RegisterDTO)
- [ ] Test the registration and login functionality

#### **API Endpoints**:

```
POST /api/auth/register
├── Input: { email, password, fullName, phoneNumber, userRole }
└── Output: { message, userId }

POST /api/auth/login
├── Input: { email, password }
└── Output: { token, userId, email, fullName, role }

POST /api/auth/logout
└── Output: { message }

GET /api/auth/profile
├── Requires authentication
└── Output: { userId, email, fullName, role, ... }
```

#### **Testing Method**:

```
Use Postman to test:
1. Register a new user
2. Log in to get a token
3. Copy the token to the Authorization Header (Bearer Token)
4. Test a protected endpoint
```

---

### **Week 2 Deliverables**:

- ✅ ASP.NET Core project created
- ✅ Database tables created
- ✅ User authentication system implemented
- ✅ JWT token system is working correctly
- ✅ API documentation (Swagger) is accessible

---

## **Week 3 (Week 8): Backend Core Feature Development**

### **Day 1-2: Implement Doctor Management Features**

#### **API Endpoints**:

```
GET /api/doctors
└── Get a list of all doctors (can be filtered by specialty)

GET /api/doctors/{id}
└── Get details for a single doctor

POST /api/doctors (Admin only)
└── Create a new doctor profile

PUT /api/doctors/{id} (Doctor/Admin)
└── Update a doctor's profile

DELETE /api/doctors/{id} (Admin only)
└── Delete a doctor
```

---

### **Day 3-4: Implement Appointment Management Features**

#### **API Endpoints**:

```
GET /api/appointments (Requires authentication)
└── Get the current user's appointment list
    └── Patient: All my appointments
    └── Doctor: My patient appointments

POST /api/appointments
└── Create a new appointment

PUT /api/appointments/{id}/confirm (Doctor only)
└── Doctor confirms an appointment

PUT /api/appointments/{id}/cancel
└── Cancel an appointment

GET /api/appointments/{id}
└── Get details of an appointment
```

---

### **Day 5-7: Implement Medical Record and Prescription Features**

#### **API Endpoints**:

```
Medical Records:
GET /api/medical-records (Requires authentication)
POST /api/medical-records (Doctor only)
GET /api/medical-records/{id}
PUT /api/medical-records/{id} (Doctor only)

Prescriptions:
GET /api/prescriptions
POST /api/prescriptions (Doctor only)
GET /api/prescriptions/{id}
```

---

### **Week 3 Deliverables**:

- ✅ Doctor management APIs are complete
- ✅ Appointment management APIs are complete
- ✅ Medical record management APIs are complete
- ✅ Prescription management APIs are complete
- ✅ All APIs have been tested with Postman

---

## **Week 4 (Week 9): Frontend Foundation Development**

### **Day 1-2: Create React Project**

#### **Create the Project**:

```bash
# Use Vite for creation (faster than create-react-app)
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install

# Install necessary libraries
npm install axios react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-toastify
npm install recharts
npm install date-fns
npm install formik yup
npm install @tanstack/react-query
```

#### **Project Structure**:

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable Components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── DoctorCard.tsx
│   │   ├── AppointmentCard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/           # Page Components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DoctorList.tsx
│   │   ├── BookAppointment.tsx
│   │   ├── MyAppointments.tsx
│   │   └── AISymptomAnalyzer.tsx
│   ├── services/        # API Service Layer
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── doctorService.ts
│   │   └── appointmentService.ts
│   ├── contexts/        # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom Hooks
│   │   └── useAuth.ts
│   ├── types/           # TypeScript Type Definitions
│   │   └── index.ts
│   ├── utils/           # Utility Functions
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables
├── package.json
└── tsconfig.json
```

#### **Environment Variable Configuration**:

```
.env.development:
VITE_API_URL=https://localhost:5001/api

.env.production:
VITE_API_URL=https://your-ec2-domain.com/api
```

---

### **Day 3-4: Implement Authentication-related Pages**

#### **Task List**:

- [ ] Create the Login page
- [ ] Create the Register page
- [ ] Create an `AuthContext` (for global authentication state)
- [ ] Implement a `ProtectedRoute` component
- [ ] Configure React Router

---

### **Day 5-7: Implement Core Pages**

#### **Task List**:

- [ ] Dashboard page (displaying different content based on user role)
- [ ] DoctorList page (for patients to view doctors)
- [ ] BookAppointment page (appointment form)
- [ ] MyAppointments page (list of appointments)
- [ ] Navbar component
- [ ] Footer component

---

### **Week 4 Deliverables**:

- ✅ React project has been created
- ✅ Authentication pages are complete (Login/Register)
- ✅ Basic pages are complete
- ✅ Frontend and backend can communicate correctly
- ✅ JWT authentication flow is working

---

## **Week 5 (Week 10): AI Feature Integration**

### **Day 1-2: Set up Google Gemini API**

#### **Register for Gemini API**:

```
Steps:
1. Visit https://aistudio.google.com/
2. Log in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key to your backend's appsettings.json

Free Tier:
├── 60 requests/minute
├── 1,500 requests/day
└── Free access to gemini-pro and gemini-pro-vision models
```

#### **Implement `AIService` in the Backend**:

```
Function 1: Symptom Analysis
├── Input: Symptom description text
├── Processing: Call the Gemini API
└── Output: 
    ├── Possible causes
    ├── Recommended department
    └── Precautions

Function 2: Medication Identification
├── Input: Medication image (Base64)
├── Processing: Call Gemini Pro Vision
└── Output: Medication name and purpose

Function 3: Report Interpretation
├── Input: Lab report text
├── Processing: AI analyzes abnormal indicators
└── Output: Health advice
```

#### **API Endpoints**:

```
POST /api/ai/analyze-symptoms
├── Input: { symptoms: "headache, fever, cough" }
└── Output: { analysis, recommendedSpecialty, severity }

POST /api/ai/identify-medicine
├── Input: { imageBase64: "..." }
└── Output: { medicineName, usage, precautions }

POST /api/ai/interpret-report
├── Input: { reportText: "..." }
└── Output: { abnormalItems, recommendations }
```

---

### **Day 3-4: Frontend AI Feature Pages**

#### **Task List**:

- [ ] Create the `AISymptomAnalyzer` page
- [ ] Implement the symptom input form
- [ ] Display the AI analysis results
- [ ] Create a `MedicineIdentifier` component
- [ ] Implement the image upload functionality
- [ ] Create a `ReportInterpreter` component

---

### **Day 5-7: Implement Vector Database (pgvector)**

#### **Enable pgvector in RDS**:

```sql
-- Connect to the RDS database
psql -h [RDS-endpoint] -U postgres -d healthcaredb

-- Install the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the symptom vectors table
CREATE TABLE symptom_vectors (
    vector_id SERIAL PRIMARY KEY,
    symptom_text TEXT NOT NULL,
    embedding VECTOR(1536),
    recommended_specialty VARCHAR(100),
    diagnosis TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create a vector index
CREATE INDEX ON symptom_vectors 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

#### **Implement Vector Search Functionality**:

```
Workflow:
1. User inputs symptoms
2. Call an Embedding API (e.g., OpenAI's) to convert to a vector
3. Search for similar symptoms in pgvector
4. Return historically similar cases
5. Combine with Gemini analysis to provide a suggestion
```

---

### **Week 5 Deliverables**:

- ✅ Gemini API has been integrated
- ✅ AI symptom analysis feature is complete
- ✅ Medication identification feature is complete
- ✅ pgvector search has been implemented
- ✅ Frontend AI pages are complete

---

## **Week 6 (Week 11): Blockchain & Advanced Features**

### **Day 1-3: Implement Blockchain System**

#### **Backend `BlockchainService` Implementation**:

```
Block Structure:
├── BlockIndex
├── Timestamp
├── DataType (MedicalRecord/Prescription)
├── ReferenceId (Associated record ID)
├── DataHash (SHA-256 hash of the data)
├── PreviousHash
└── BlockHash (Current block's hash)

Core Functions:
├── AddBlock() - Add a new block to the chain
├── ValidateChain() - Verify the integrity of the entire chain
├── GetBlockByReference() - Query a block by its reference
└── GetFullChain() - Retrieve the entire chain
```

#### **Integration with the Medical Record System**:

```
Workflow:
1. Doctor creates a medical record → Save it to PostgreSQL
2. Automatically call BlockchainService.AddBlock()
3. Calculate the data hash and create a new block
4. Link it to the previous block
5. Save the new block to the Blockchain table
6. Return the block hash to the frontend for display
```

#### **API Endpoints**:

```
GET /api/blockchain/verify
└── Verify the integrity of the entire chain

GET /api/blockchain/record/{recordId}
└── Query the block information for a specific record

GET /api/blockchain/chain (Admin only)
└── Get the complete blockchain
```

---

### **Day 4-5: S3 File Upload Functionality**

#### **Backend `S3Service` Implementation**:

```
Functions:
├── UploadFile() - Upload a file to S3
├── GetFileUrl() - Get a pre-signed URL for a file
├── DeleteFile() - Delete a file
└── ListFiles() - List a user's files
```

#### **API Endpoints**:

```
POST /api/files/upload
├── Input: multipart/form-data
└── Output: { fileUrl, fileKey }

GET /api/files
└── Get all files for the current user

DELETE /api/files/{fileKey}
└── Delete a file
```

---

### **Day 6-7: DynamoDB Health Data Functionality**

#### **Backend `DynamoDBService` Implementation**:

```
Functions:
├── SaveHealthMetric() - Save health data
├── GetPatientMetrics() - Get a patient's health data
├── GetMetricsByDateRange() - Query metrics by date range
└── GetLatestMetric() - Get the most recent metric
```

#### **API Endpoints**:

```
POST /api/health-metrics
└── Save health data

GET /api/health-metrics
└── Get the current user's health data

GET /api/health-metrics/chart?days=30
└── Get data for charts (e.g., last 30 days)
```

#### **Frontend Implementation**:

- [ ] Create a `HealthMetricsPage`
- [ ] Implement the data input form
- [ ] Use Recharts to display trend charts

---

### **Week 6 Deliverables**:

- ✅ Blockchain system is complete
- ✅ S3 file upload functionality is complete
- ✅ DynamoDB health data functionality is complete
- ✅ All advanced features have been integrated

---

## **Week 7 (Week 12-13): AWS Deployment & Monitoring**

### **Day 1-2: Deploy Backend to EC2**

#### **Connect to EC2**:

```bash
# On Windows (use Git Bash or PowerShell)
ssh -i "your-key.pem" ubuntu@[EC2-Public-IP]

# On first connection, you may need to set permissions
chmod 400 your-key.pem
```

#### **Install .NET on EC2**:

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install .NET 8.0 SDK
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-8.0

# Verify installation
dotnet --version
```

#### **Deploy the Application**:

```bash
# Build a release version locally
dotnet publish -c Release -o ./publish

# Compress the files
tar -czf publish.tar.gz publish/

# Upload to EC2 (use WinSCP on Windows or scp)
scp -i "your-key.pem" publish.tar.gz ubuntu@[EC2-IP]:/home/ubuntu/

# On EC2, decompress the file
tar -xzf publish.tar.gz
cd publish

# Run the application
dotnet HealthcareAPI.dll

# Set environment variables
export ASPNETCORE_URLS="http://0.0.0.0:5000"
export ASPNETCORE_ENVIRONMENT="Production"
```

#### **Configure Systemd Service (to run in the background)**:

```bash
# Create a service file
sudo nano /etc/systemd/system/healthcare-api.service

# File content:
[Unit]
Description=Healthcare API

[Service]
WorkingDirectory=/home/ubuntu/publish
ExecStart=/usr/bin/dotnet /home/ubuntu/publish/HealthcareAPI.dll
Restart=always
RestartSec=10
User=ubuntu
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5000

[Install]
WantedBy=multi-user.target

# Start the service
sudo systemctl enable healthcare-api
sudo systemctl start healthcare-api
sudo systemctl status healthcare-api
```

---

### **Day 3-4: Deploy Frontend to S3 + CloudFront**

#### **Build the React Application**:

```bash
# In the frontend directory
npm run build

# Output will be in the dist/ directory
```

#### **Upload to S3**:

```bash
# Install the AWS CLI
# Windows: https://aws.amazon.com/cli/
# macOS: brew install awscli

# Configure the AWS CLI
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Region: ap-southeast-1

# Upload to S3
aws s3 sync dist/ s3://healthcare-frontend-[your-student-id]/ --delete

# Set the bucket policy (for public access)
aws s3api put-bucket-policy --bucket healthcare-frontend-[your-student-id] --policy file://bucket-policy.json
```

#### **bucket-policy.json**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::healthcare-frontend-[your-student-id]/*"
    }
  ]
}
```

#### **Configure CloudFront**:

```
AWS Console → CloudFront → Create Distribution

Configuration:
├── Origin domain: healthcare-frontend-[your-student-id].s3.ap-southeast-1.amazonaws.com
├── Origin path: (leave blank)
├── Viewer protocol policy: Redirect HTTP to HTTPS
├── Allowed HTTP methods: GET, HEAD, OPTIONS
├── Cache policy: CachingOptimized
└── Price class: Use only North America, Europe, Asia, Middle East, and Africa (or your choice)
```

#### **CloudFront Configuration (Continued)**:

```
Error Pages Configuration:
├── 404 Not Found → /index.html (200 Response)
└── 403 Forbidden → /index.html (200 Response)
    └── Reason: React Router needs all routes to return index.html to handle routing client-side.

After deployment:
└── CloudFront will generate a domain name like: d1234abcd.cloudfront.net
└── Record this domain and update your frontend environment variables.
```

#### **Update Frontend API Address**:

```bash
# Modify .env.production
VITE_API_URL=http://[EC2-Public-IP]:5000/api

# Rebuild
npm run build

# Re-upload to S3
aws s3 sync dist/ s3://healthcare-frontend-[your-student-id]/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id [your-distribution-id] --paths "/*"
```

---

### **Day 5: Configure CloudWatch Monitoring**

#### **Install CloudWatch Agent on EC2**:

```bash
# Download the CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# Install it
sudo dpkg -i amazon-cloudwatch-agent.deb

# Create the configuration file
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/config.json
```

#### **CloudWatch Agent Configuration File**:

(This file allows collecting custom metrics like memory usage and application logs)
```json
{
  "agent": { "metrics_collection_interval": 60, "run_as_user": "cwagent" },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/publish/logs/*.log",
            "log_group_name": "/aws/ec2/healthcare-api",
            "log_stream_name": "{instance_id}",
            "timezone": "UTC"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "Healthcare/API",
    "metrics_collected": {
      "cpu": { "measurement": [{"name": "cpu_usage_idle", "rename": "CPU_IDLE", "unit": "Percent"}], "metrics_collection_interval": 60, "totalcpu": false },
      "disk": { "measurement": [{"name": "used_percent", "rename": "DISK_USED", "unit": "Percent"}], "metrics_collection_interval": 60, "resources": ["*"] },
      "mem": { "measurement": [{"name": "mem_used_percent", "rename": "MEM_USED", "unit": "Percent"}], "metrics_collection_interval": 60 }
    }
  }
}
```

#### **Start the CloudWatch Agent**:

```bash
# Start the agent with the new config
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Check the status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a query -m ec2 -s
```

---

#### **Log Custom Metrics from ASP.NET**:

```
Install package:
dotnet add package AWSSDK.CloudWatch

Implement a MetricsService:
├── RecordAPIRequest() - Record API request count
├── RecordAPIResponseTime() - Record response time
├── RecordAppointmentCreated() - Record appointment creation count
├── RecordAIAPICall() - Record AI API call count
└── RecordError() - Record error count
```

---

### **Day 6: Create CloudWatch Dashboard**

#### **Create a Dashboard in the AWS Console**:

```
AWS Console → CloudWatch → Dashboards → Create dashboard

Dashboard Name: Healthcare-Monitoring

Add Widgets:
┌────────────────────────────────────────┐
│ Widget 1: EC2 CPU Utilization          │
│ ├── Type: Line graph                   │
│ ├── Metric: AWS/EC2 → CPUUtilization  │
│ └── Statistic: Average, Period: 5min  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Widget 2: Memory Usage                 │
│ ├── Type: Line graph                   │
│ ├── Metric: Healthcare/API → MEM_USED │
│ └── Statistic: Average, Period: 5min  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Widget 3: RDS Database Connections     │
│ ├── Type: Number                       │
│ ├── Metric: AWS/RDS → DatabaseConnections │
│ └── Statistic: Sum                     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Widget 4: API Requests (Custom Metric) │
│ ├── Type: Line graph                   │
│ ├── Metric: Healthcare/API → APIRequests │
│ └── Statistic: Sum, Period: 5min      │
└────────────────────────────────────────┘

(Add more widgets for Appointments Created, AI API Calls, Error Rate, S3 Bucket Size, etc.)
```

---

### **Day 7: Configure Lambda Functions & Alarms**

#### **Lambda Function 1: Appointment Reminder**

**Create a Lambda Function**:

```
AWS Console → Lambda → Create function

Configuration:
├── Function name: healthcare-appointment-reminder
├── Runtime: .NET 8 (C#/PowerShell)
├── Architecture: x86_64
└── Execution role: Create new role with basic Lambda permissions
```

**Add RDS Access Permissions** to the Lambda's IAM role.

**Lambda Function Code Structure**:

```csharp
public class Function
{
    public async Task FunctionHandler(ILambdaContext context)
    {
        // 1. Connect to the RDS database
        // 2. Query for appointments happening tomorrow
        // 3. Send email/SMS reminders
        // 4. Log to CloudWatch Logs
    }
}
```

**Configure an EventBridge Trigger**:

```
EventBridge → Rules → Create rule

Configuration:
├── Name: daily-appointment-reminder
├── Event source: Schedule
├── Cron expression: 0 12 * * ? *  (Daily at 12:00 UTC, which is 8 PM Malaysia Time)
└── Target: The Lambda function
```

---

#### **Configure CloudWatch Alarms**

**Alarm 1: High CPU Utilization**

```
AWS Console → CloudWatch → Alarms → Create alarm

Configuration:
├── Metric: EC2 CPUUtilization
├── Threshold: >= 80%
├── Datapoints: 2 out of 2
├── Period: 5 minutes
└── Action: Send an SNS notification to your email
```

(Create similar alarms for High Error Rate and High Database Connections)

---

### **Week 7 Deliverables**:

- ✅ Backend deployed to EC2 and running correctly
- ✅ Frontend deployed to S3 + CloudFront
- ✅ CloudWatch monitoring configured
- ✅ Custom dashboard created
- ✅ Lambda functions deployed
- ✅ Alarms are set
- ✅ Application is accessible via the CloudFront domain

---

## **Week 8 (Week 14): Testing, Optimization & Documentation**

### **Day 1: Comprehensive Functional Testing**

#### **Test Checklist**:

**Patient-side Testing**:
```
✅ User Registration (email validation, password strength)
✅ User Login (correct/incorrect credentials, JWT generation)
✅ View Doctor List (filtering, pagination)
✅ AI Symptom Analysis (various inputs, response time)
✅ Book Appointment (selection, form submission)
✅ View My Appointments (list display, cancellation)
✅ Record Health Data (input, chart display)
✅ File Upload (upload to S3, download)
```

**Doctor-side Testing**:
```
✅ View Appointment List (pending appointments, date filtering)
✅ Confirm Appointment (status update)
✅ Fill Medical Record (diagnosis input, blockchain record check)
✅ Issue Prescription (add medication, check on-chain)
```

**Admin-side Testing**:
```
✅ User Management (view list, edit, disable/enable)
✅ System Monitoring (view CloudWatch Dashboard, verify metrics)
✅ Blockchain Validation (check chain integrity, tamper detection)
```

---

### **Day 2: Performance Optimization**

#### **Optimization Checklist**:

**Frontend Optimization**:
```
✅ Code Splitting (use React.lazy() for route-based splitting)
✅ Image Optimization (compress images, use WebP)
✅ API Call Optimization (use TanStack Query for caching)
✅ Bundle Size Optimization (remove unused dependencies, tree shaking)
```

**Backend Optimization**:
```
✅ Database Query Optimization (add necessary indexes, avoid N+1 queries)
✅ Caching (use IMemoryCache for hot data, DynamoDB for AI results)
✅ API Response Optimization (use DTOs, enable Gzip compression, pagination)
✅ Asynchronous Processing (for file uploads, blockchain operations)
```

---

### **Day 3: Security Hardening**

#### **Security Checklist**:
```
Authentication & Authorization:
✅ Secure JWT Tokens (strong secret key, reasonable expiration)
✅ Password Security (BCrypt, strength requirements, brute-force protection)
✅ API Authorization (role-based access control on all sensitive endpoints)

Data Security:
✅ SQL Injection Prevention (use Entity Framework's parameterized queries)
✅ XSS Protection (content sanitization, Content Security Policy headers)
✅ CSRF Protection (use ASP.NET's built-in anti-forgery tokens)
✅ Data Encryption (enforce HTTPS, encrypt sensitive data at rest in S3)

AWS Security:
✅ EC2 Security Groups (least privilege principle, restrict SSH access)
✅ RDS Security (disable public access in production, use SSL connections)
✅ S3 Security (least privilege bucket policies, enable versioning)
✅ IAM Permissions (use IAM roles on EC2 instead of hard-coded keys)
```

---

### **Day 4-6: Write the Complete Project Documentation**

#### **Documentation Structure (30-40 pages)**:

1.  **Cover Page**
2.  **Table of Contents**
3.  **Executive Summary** (Project background, goals, tech stack, key outcomes)
4.  **Introduction** (Problem statement, project objectives, scope)
5.  **Literature Review** (Concepts of cloud computing, AI in healthcare, blockchain in healthcare)
6.  **System Architecture** (High-level diagram, detailed tech stack, AWS service integration, security architecture)
7.  **Database Design** (ER Diagram, detailed table structures for SQL and NoSQL, data flow)
8.  **System Implementation** (Detailed explanation of key modules like user management, AI, blockchain, with code snippets and screenshots)
9.  **Cloud Services Integration** (Details on EC2 deployment, RDS config, S3+CloudFront setup, Lambda, DynamoDB)
10. **Monitoring and Performance** (CloudWatch dashboard screenshot, key metrics, alarms, logging strategy)
11. **Testing** (Test strategy, sample test cases, results)
12. **User Guide** (Step-by-step guides for Patient, Doctor, and Admin roles)
13. **Challenges and Solutions** (Problems encountered and how they were solved)
14. **Future Enhancements** (Potential future improvements)
15. **Conclusion** (Summary of achievements and learnings)
16. **References**
17. **Appendices** (Key code snippets, API documentation, etc.)

---

### **Day 7: Prepare Presentation Materials**

#### **Demo Video (8-10 minutes)**:

**Video Structure**:
```
0:00-0:30  Introduction (Name, project title, tech stack)
0:30-1:30  System Architecture Walkthrough (Show diagram, explain services)
1:30-3:00  Patient Demo (Register, AI analysis, book appointment, view records)
3:00-4:30  Doctor Demo (View/confirm appointment, create medical record, issue prescription)
4:30-5:30  Admin Demo (Show CloudWatch Dashboard, blockchain verification)
5:30-7:00  Technical Highlights (Deep dive into AI, Blockchain, Vector DB)
7:00-8:00  AWS Services Showcase (Quick tour of EC2, RDS, S3 console)
8:00-9:00  Monitoring & Performance (Show dashboard metrics)
9:00-10:00 Conclusion (Summarize achievements, learnings)
```

**Tools**: OBS Studio (recording), DaVinci Resolve (editing).
**Requirements**: 1080p, 30 FPS, clear audio, smooth flow, upload to YouTube (Unlisted).

---

#### **PowerPoint Presentation (15-20 slides)**:

**PPT Structure**:
Follow a logical flow from introduction to conclusion, using high-quality screenshots and diagrams. Each slide should be concise and visual.

---

### **Week 8 Final Checklist**:

**Technical Functionality**:
```
✅ All frontend pages render correctly.
✅ All backend APIs work as expected.
✅ Database connection is stable.
✅ All AWS services are running.
✅ AI and Blockchain features are functional.
```

**Documentation**:
```
✅ All sections are complete.
✅ Diagrams are clear and accurate.
✅ Proofread for spelling and grammar.
✅ PDF is exported correctly.
```

**Presentation Materials**:
```
✅ Video is recorded, edited, and uploaded.
✅ PPT is complete and professional.
✅ All materials are backed up.
```

---

## 🎓 **Submission Checklist**

1.  **Documentation (PDF format)**: Main report, User Manual, API Documentation.
2.  **Source Code (GitHub Repository)**: Well-structured with a detailed `README.md`.
3.  **Presentation Materials**: Link to the YouTube video, PPT file, and live demo URL.
4.  **Other Materials**: CloudWatch dashboard export (JSON), test reports, etc.

---

## 💰 **Completely Free Tier Solution - Cost Breakdown**

### **AWS Services Free Tier Usage**:

| Service        | Free Tier Allowance                      | Estimated Usage | Cost      |
|----------------|------------------------------------------|-----------------|-----------|
| **EC2 (t2.micro)** | 750 hours/month (12 months)              | ~720 hours/month| **$0.00** ✅ |
| **RDS (db.t3.micro)**| 750 hours/month, 20GB storage (12 mo.) | ~720 hours/month| **$0.00** ✅ |
| **S3**           | 5GB storage, 20k GETs, 2k PUTs         | ~2GB            | **$0.00** ✅ |
| **CloudFront**   | 1TB data transfer/month                  | ~50GB           | **$0.00** ✅ |
| **DynamoDB**     | 25GB storage (perpetual)                 | ~1GB            | **$0.00** ✅ |
| **Lambda**       | 1M requests/month                        | ~10,000 reqs    | **$0.00** ✅ |
| **CloudWatch**   | Basic monitoring, 5GB logs, 3 dashboards | Within limits   | **$0.00** ✅ |

**Estimated Total Monthly Cost: $0 - $2**
**Total Project Cost (8 weeks): $0 - $4** ✅

### **External Services Costs**:
- **Google Gemini API**: Free tier (60 reqs/min) is sufficient. **Cost: $0.00** ✅
- **GitHub**: Free private/public repositories. **Cost: $0.00** ✅
- **Development Tools**: VS Community, VS Code, Node.js are all free. **Cost: $0.00** ✅

---

## ⚠️ **Important Notes**

### **AWS Cost Control**:

1.  **Set a Budget Alert (Mandatory!)**: Go to AWS Billing → Budgets and create a cost budget for $1.00 with an alert at 50% ($0.50).
2.  **Monitor Usage Daily**: Check the AWS Billing Dashboard and Cost Explorer.
3.  **Clean Up Resources After Submission**: Terminate EC2, delete RDS, empty S3, delete CloudFront distribution, etc. ⚠️ **Failure to do so will result in charges!**

### **Development Best Practices**:

- **Code Management**: Use Git daily. Write meaningful commit messages. Do not commit sensitive information (add `.env` to `.gitignore`).
- **Backup Strategy**: Push to GitHub regularly. Back up the database and documentation.
- **Security**: Never hard-code secrets. Use environment variables.

---

## 🎉 **Conclusion**

This plan provides:
- ✅ A complete 8-week development schedule
- ✅ Detailed technology choices and justifications
- ✅ A step-by-step implementation guide
- ✅ A completely free-tier AWS solution
- ✅ Distinction-level bonus features
- ✅ A professional documentation template

By following this plan, you will be able to successfully complete a high-quality, advanced project within the given timeframe and budget, gaining valuable skills in modern cloud and AI technologies.

**Good Luck! You can do it!** 🚀
