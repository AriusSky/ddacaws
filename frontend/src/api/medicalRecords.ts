import { http } from './http'
import type { MedicalRecordDetail } from '../types'

export async function getMyRecords(): Promise<MedicalRecordDetail[]> {
    const res = await http.get('/medical-records')
    return res.data
}

export async function getRecord(id: number): Promise<MedicalRecordDetail> {
    const res = await http.get(`/medical-records/${id}`)
    return res.data
}

export async function downloadRecordPdf(id: number): Promise<Blob> {
    const res = await http.get(`/medical-records/${id}/pdf`, { responseType: 'blob' })
    return res.data
}
