# 🎯 Healthcare Smart Appointment & Health Monitoring System

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Backend](https://img.shields.io/badge/.NET-8.0-blueviolet?logo=dotnet)
![Database](https://img.shields.io/badge/Database-PostgreSQL-informational)
![Cloud](https://img.shields.io/badge/Cloud-AWS-orange)
![License](https://img.shields.io/badge/License-MIT-green)

A cloud-native intelligent medical platform integrating AI symptom analysis, blockchain medical records, and real-time health monitoring to provide an efficient, secure, and smart healthcare experience. This project is developed for the course **CT071-3-3-DDAC**.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Folder Structure](#-folder-structure)

---

## 🏥 Project Overview

This project addresses key challenges in the healthcare industry, including inefficient appointment scheduling, disorganized medical records, and a lack of continuous patient health monitoring. Our solution is a modern, full-stack web application built on a robust, scalable cloud infrastructure.

For a complete breakdown, see the [Full Implementation Plan](./docs/implementation-plan.md).

---

## ✨ Core Features

- **For Patients:** AI Symptom Analysis, Online Appointment Booking, EMR Access (Blockchain-verified), and Health Data Tracking.
- **For Doctors:** Appointment Management, Digital Patient Records, E-Prescriptions, and Patient Health Monitoring Dashboards.
- **For Admins:** User Management, System Monitoring (via CloudWatch), Data Analytics, and Blockchain Integrity Checks.

---

## 🏗️ System Architecture

The application follows a frontend-backend separation architecture, fully deployed on AWS for scalability, reliability, and security.

*(A simplified diagram can be placed here once created)*
```
[User Browser] -> [AWS CloudFront/S3 (Frontend)] -> [AWS EC2 (Backend)] -> [AWS RDS/DynamoDB (Databases)]
```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** ASP.NET Core 8.0 Web API
- **ORM:** Entity Framework Core 8.0
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** SignalR (for future enhancements)

### Database
- **Primary (Relational):** AWS RDS for PostgreSQL 15
- **Vector Search:** `pgvector` extension
- **NoSQL:** AWS DynamoDB

### Cloud & DevOps
- **Hosting:** AWS EC2 (Backend), AWS S3 + CloudFront (Frontend)
- **Serverless:** AWS Lambda
- **Monitoring:** AWS CloudWatch
- **Storage:** AWS S3
- **CI/CD:** GitHub Actions (to be implemented)

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) (for local development)
- [Git](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/healthcare-smart-system.git
cd healthcare-smart-system
```

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Restore dependencies
dotnet restore

# Configure your local database connection in `src/HealthcareAPI/appsettings.Development.json`
# (You might need to create this file from appsettings.json)
# "ConnectionStrings": {
#   "DefaultConnection": "Host=localhost;Port=5432;Database=healthcaredb_local;Username=postgres;Password=your_password"
# }

# Apply database migrations (once they are created)
# dotnet ef database update --project src/HealthcareAPI

# Run the backend server
dotnet run --project src/HealthcareAPI
# The API will be available at https://localhost:5001 (or similar)
```

## 📁 Folder Structure

```
/
├── backend/              # ASP.NET Core solution
├── frontend/             # Frontend application
├── database/             # SQL scripts and database documentation
├── deployment/           # Deployment scripts (Docker, etc.)
├── docs/                 # Project documentation
└── README.md             # This file
```
