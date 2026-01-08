import { http } from './http'
import type { DoctorWithProfile } from '../types'

export async function getDoctors(params?: { specialty?: string; search?: string }) {
    const res = await http.get('/doctors', { params })
    return res.data as DoctorWithProfile[]
}

export async function getDoctor(id: number) {
    const res = await http.get(`/doctors/${id}`)
    return res.data as DoctorWithProfile
}