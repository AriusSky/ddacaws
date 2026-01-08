import {http} from './http';
import type {PrescriptionDetail} from '../types';
import type {AxiosResponse} from "axios";

// Helper to parse the medications string
const parsePrescription = (p: any): PrescriptionDetail => {
    if (p.medications && typeof p.medications === 'string') {
        try {
            p.medications = JSON.parse(p.medications);
        } catch (e) {
            console.error("Failed to parse medications for prescription:", p.prescriptionId);
            p.medications = []; // Default to empty array on failure
        }
    }
    return p as PrescriptionDetail;
};

export async function getMyPrescriptions(): Promise<PrescriptionDetail[]> {
    const res: AxiosResponse<PrescriptionDetail[]> = await http.get('/prescriptions');
    const prescriptions = res.data;
    // Map over the array and parse each one
    return prescriptions.map(parsePrescription);
}

export async function getPrescription(id: string): Promise<PrescriptionDetail> {
    const res = await http.get(`/prescriptions/${id}`);
    return parsePrescription(res.data);
}
