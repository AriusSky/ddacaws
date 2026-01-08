import { http } from '../http'
import type {
    HealthMetricInput,
    MedicalRecordDetail,
    MedicalRecordInput,
    Prescription,
    PrescriptionDetail,
    PrescriptionInput,
    VitalRecord
} from '../../types'
import axios, {type AxiosResponse} from "axios";

type DoctorPrescription = {
    id: number
    appointmentId: number
    patientId: number
    medicines: Array<{ name: string; dosage: string; frequency: string }>
    createdAt: string
}

export async function listDoctorMedicalRecords(): Promise<MedicalRecordDetail[]> {
    const res = await http.get('/medical-records');
    return res.data;
}

export async function upsertMedicalRecord(data: MedicalRecordInput): Promise<MedicalRecordDetail> {
    if (data.recordId) {
        // update existing
        const res = await http.put(`/medical-records/${data.recordId}`, data);
        return res.data;
    } else {
        // create
        const res = await http.post('/medical-records', data);
        return res.data;
    }
}


export async function listDoctorPrescriptions(): Promise<PrescriptionDetail[]> {
        const res = await http.get('/prescriptions')
        return res.data
}

export async function issuePrescription(data: PrescriptionInput): Promise<PrescriptionDetail>  {
    const res = await http.post('/prescriptions', data);
    return res.data;
}
export async function recordHealthMetric(data: HealthMetricInput): Promise<any> {
    const res = await http.post('/health-metrics', data);
    return res.data;
}
