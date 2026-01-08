import { http } from '../http'

// Types for AI responses
export interface CaseRecommendation {
  id: string
  summary: string
}

export interface MedicationSuggestion {
  drug: string
  note: string
}

export interface DrugInteraction {
  severity: 'High' | 'Medium' | 'Low'
  message: string
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

// Similar case recommendations (now calls backend AI endpoint)
export async function getSimilarCases(symptom: string): Promise<CaseRecommendation[]> {
    const response = await http.post('/ai/similar-cases', { symptoms: symptom })
    return Array.isArray(response.data) ? response.data : [response.data]
}

// Medication suggestions (now calls backend AI endpoint)
export async function getMedicationSuggestions(diagnosis: string): Promise<MedicationSuggestion[]> {
    const response = await http.post('/ai/medication-suggestions', { diagnosis })
    return Array.isArray(response.data) ? response.data : [response.data]
}

// Drug interaction check (now calls backend AI endpoint)
export async function checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
    const response = await http.post('/ai/drug-interactions', { drugs })
    return Array.isArray(response.data) ? response.data : [response.data]
}

// Identify medicine from image (Auth Required)
export async function identifyMedicineFromImage(imageBase64: string): Promise<MedicineIdentificationResult> {
    const response = await http.post(
        '/ai/identify-medicine',
        { imageBase64 },
        { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data
}

// Interpret medical report (Auth Required)
export async function interpretMedicalReport(reportText: string): Promise<ReportInterpretationResult> {
    const response = await http.post('/ai/interpret-report', {
        reportText,
    })
    return response.data
}