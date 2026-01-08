import { http } from './http'

// Types for AI responses
export interface SymptomAnalysisResult {
  recommendedSpecialty: string
  possibleConditions: string[]
  urgency: 'Low' | 'Medium' | 'High'
}

export interface MedicineIdentificationResult {
  medicineName: string
  usage: string
  precautions: string
}

export interface ReportInterpretationResult {
  summary: string
  abnormalItems: string[]
  recommendations: string
}

// 1. Analyze Symptoms (No Auth Required) - Used by Patient AI Consultation
export async function analyzeSymptoms(symptoms: string): Promise<SymptomAnalysisResult> {
  const response = await http.post('/ai/analyze-symptoms', {
    symptoms,
  })
  return response.data
}

// 2. Identify Medicine (Auth Required) - Used by Doctor AI Tools
export async function identifyMedicine(imageBase64: string): Promise<MedicineIdentificationResult> {
  const response = await http.post(
    '/ai/identify-medicine',
    { imageBase64 },
    { headers: { 'Content-Type': 'application/json' } }
  )
  return response.data
}

// 3. Interpret Report (Auth Required) - Used by Doctor AI Tools
export async function interpretReport(reportText: string): Promise<ReportInterpretationResult> {
  const response = await http.post('/ai/interpret-report', {
    reportText,
  })
  return response.data
}
