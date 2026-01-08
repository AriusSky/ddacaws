import { http } from './http'
import type { Appointment, AppointmentWithDoctorAndPatient } from '../types'

export async function getMyAppointments(): Promise<AppointmentWithDoctorAndPatient[]> {
    const res = await http.get('/appointments')
    return res.data
}

export async function getAppointment(id: number): Promise<AppointmentWithDoctorAndPatient> {
    const res = await http.get(`/appointments/${id}`)
    return res.data
}

export async function createAppointment(data: {
    doctorId: number
    date: string
    timeSlot: string
    symptom?: string
}): Promise<AppointmentWithDoctorAndPatient> {
    // Parse time slot to extract start time
    const timeMatch = data.timeSlot.match(/(\d{1,2}):(\d{2})\s(AM|PM)/i)
    let appointmentDateTime = new Date(data.date)
    
    if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10)
        const minutes = parseInt(timeMatch[2], 10)
        const period = timeMatch[3].toUpperCase()
        
        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
        
        appointmentDateTime.setHours(hours, minutes, 0, 0)
    }
    
    // Get timezone offset and adjust the ISO string to represent local time as UTC
    // This preserves the local time the user selected
    const tzOffset = appointmentDateTime.getTimezoneOffset() * 60000
    const localDateTime = new Date(appointmentDateTime.getTime() - tzOffset)
    
    // Transform frontend data to match backend DTO
    const backendData = {
        doctorId: data.doctorId,
        appointmentDate: localDateTime.toISOString(),
        timeSlot: data.timeSlot, // Send the original time slot string
        symptoms: data.symptom || 'General consultation'
    }
    const res = await http.post('/appointments', backendData)
    return res.data
}

export async function updateAppointment(id: number, data: Partial<Appointment>): Promise<AppointmentWithDoctorAndPatient> {
    const res = await http.put(`/appointments/${id}`, data)
    return res.data
}

export async function confirmAppointment(id: number): Promise<AppointmentWithDoctorAndPatient> {
    const res = await http.put(`/appointments/${id}/confirm`, {})
    return res.data
}

export async function cancelAppointment(id: number, reason?: string): Promise<void> {
    await http.put(`/appointments/${id}/cancel`, { reason })
}

export async function completeAppointment(id: number, notes?: string, aiAnalysis?: string): Promise<Appointment> {
    const res = await http.put(`/appointments/${id}`, { notes, aiAnalysis, status: 'Completed' })
    return res.data
}