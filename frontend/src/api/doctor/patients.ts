import { http } from '../http'
import type {Profile, MedicalRecord, MedicalRecordDetail} from '../../types'

export async function listMyPatients(): Promise<Profile[]> {
    const res = await http.get('/patients')
    return res.data
}

export async function getPatientRecords(patientId: number): Promise<MedicalRecordDetail[]> {
    const res = await http.get(`/patients/${patientId}/records`)
    return res.data
}

export async function getPatientVitals(patientId: number) {
    const res = await http.get(`/patients/${patientId}/vitals`)
    return res.data
}
