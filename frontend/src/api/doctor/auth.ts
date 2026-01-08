import { http } from '../http'
import type { DoctorWithProfile } from "../../types"

export async function doctorLoginApi(credentials: { email: string; password: string }) {
  const res = await http.post('/auth/login', credentials)
  return res.data as { token: string }
}

export async function doctorGetProfile(): Promise<DoctorWithProfile> {
  const res = await http.get('/auth/doctor-profile')
  return res.data
}

export async function doctorUpdateProfile(data: Partial<DoctorWithProfile>): Promise<DoctorWithProfile> {
  const res = await http.put('/auth/profile', data)
  return res.data
}

export async function doctorLogout() {
  localStorage.removeItem('token')
}

export function getDoctorToken(): string | null {
  return localStorage.getItem('token')
}