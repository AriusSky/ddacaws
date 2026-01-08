import {http} from '../http'
import type {AppointmentWithDoctorAndPatient} from '../../types'

export async function listDoctorAppointments(): Promise<AppointmentWithDoctorAndPatient[]> {
    const res = await http.get('/appointments')
    return res.data
}
export async function listAppointmentsForMedicalRecord(): Promise<AppointmentWithDoctorAndPatient[]> {
    const res = await http.get('/appointments/for-medical-records')
    return res.data
}

export async function listDoctorAppointmentsByStatus(status: string): Promise<AppointmentWithDoctorAndPatient[]> {
    const res = await http.get('/appointments', {
        params: {status: status}
    })
    return res.data
}

export async function confirmAppointment(id: number): Promise<AppointmentWithDoctorAndPatient> {
    const res = await http.put(`/appointments/${id}/confirm`, {})
    return res.data
}

export async function rejectAppointment(id: number): Promise<AppointmentWithDoctorAndPatient> {
    const res = await http.put(`/appointments/${id}/cancel`, {})
    return res.data
}

export async function rescheduleAppointment(id: number, payload: {
    date: string;
    timeSlot: string
}): Promise<AppointmentWithDoctorAndPatient> {
    // Parse time slot to extract start time
    const timeMatch = payload.timeSlot.match(/(\d{1,2}):(\d{2})\s(AM|PM)/i)
    let appointmentDateTime = new Date(payload.date)
    
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

    const res = await http.put(`/appointments/${id}/reschedule`, {
        appointmentDate: localDateTime.toISOString(),
        timeSlot: payload.timeSlot
    })
    return res.data
}
