// -- for admin dashboard --
// Represents the basic User object, matches backend and is used by Admin panel
export type User = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string; // The backend GET /users endpoint also returns this
};

// Represents the data for the statistics cards on the Admin Dashboard
export type SystemStats = {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicalRecords: number; // Matches our updated backend stats endpoint
};

// Represents the data structure for the appointment analytics chart
export type AnalyticsData = {
  name: string; // e.g., "Mon", "Tue"
  appointments: number;
};

// The `Appointment` type in the admin panel is simpler than the one for patients/doctors.
// Let's create a specific type for the admin view.
export type AdminAppointment = {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
};
// -- end of types for admin dashboard --

// Represents the response from the blockchain verification endpoint
export type BlockchainStatus = {
  isValid: boolean;
  totalBlocks: number;
  lastBlockHash: string;
};

export type Profile = {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
};

export type Doctor = {
  doctorId: number;
  userId: number;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  biography?: string;
  consultationFee: number;
  clinicAddress?: string;
  workingHours?: string;
  rating?: number;
  totalReviews?: number;
  isAvailable: boolean;
};

export type DoctorWithProfile = Doctor & {
  profile: Profile;
};

export type IncomeStat = {
  month: string;
  total: number;
};

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export type Appointment = {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  symptom?: string;
  status: AppointmentStatus;
  aiAnalysis?: string;
  notes?: string;
  cancellationReason?: string;
  CreatedAt: string;
  UpdatedAt: string;
};

export type AppointmentWithDoctorAndPatient = Appointment & {
  doctor: DoctorWithProfile;
  patient: Profile;
};

export type CreateAppointment = {
  doctorId: number;
  date: string;
  timeSlot: string;
  symptom?: string;
};

export type UpdateAppointment = {
  date?: string;
  timeSlot?: string;
  symptom?: string;
  status?: AppointmentStatus;
};

export type DoctorSummary = {
  doctorId: number;
  fullName: string;
  specialization: string;
};

export type PatientSummary = {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
};

export type AppointmentSummary = {
  appointmentId: number;
  appointmentDate: string; // ISO string
  notes?: string;
  aiAnalysis?: string; // to verify if needed or how to integrate
};

export type Attachment = {
  fileKey: string;
  fileName: string;
  downloadUrl: string;
};

// The single, unified type for medical records
export type MedicalRecordDetail = {
  recordId: number;
  appointmentId: number;
  createdAt: string; // ISO string
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  prescriptions: PrescriptionDetail[];
  attachments?: Attachment[] | null;
  blockchainHash?: string;

  // Nested objects
  doctor: DoctorSummary;
  patient: PatientSummary;
  appointment: AppointmentSummary;
};

// This type should mirror the backend's CreateMedicalRecordDto
export type MedicalRecordInput = {
  recordId?: number; // Optional: only for updates
  appointmentId: number;
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  attachments?: string[];
};
export type VitalRecord = {
  id: number;
  patientId: number;
  recordedAt: string;
  heartRate?: number;
  bloodPressure?: string;
  temperature?: number;
};

export type Prescription = {
  prescriptionId: number;
  recordId: number;
  patientId: string;
  doctorId: string;
  medications: string[];
  dosage: string[];
  instructions: string[];
  duration: string[];
  refillsAllowed: boolean;
  issueDate: string;
  expiryDate: string;
  blockchainHash?: string;
  status: string;
};

// This mirrors the backend's PrescribedMedicationDto
export type PrescribedMedication = {
  name: string;
  strength: string;
  dosageForm: string;
  quantity: string;
  directions: string;
  notes?: string;
};

// This mirrors the backend's CreatePrescriptionDto
export type PrescriptionInput = {
  recordId: number;
  medications: PrescribedMedication[];
  generalInstructions?: string;
};

// This will be the type for READING a prescription
export type PrescriptionDetail = {
  prescriptionId: number;
  recordId: number;
  patientName: string;
  doctorName: string;
  issueDate: string; // ISO String
  medications: PrescribedMedication[];
  generalInstructions?: string;
  blockchainHash?: string;

  record: MedicalRecordDetail;
  patient: Profile;
  doctor: DoctorWithProfile;
};

export type HealthMetricInput = {
  patientId: number;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodSugar: number;
  weight: number;
  temperature?: number;
};

// Type for the chart data response from the backend
export type ChartData = {
  labels: string[];
  data: number[];
  unit: string;
};

