import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { listDoctorAppointments, confirmAppointment, rejectAppointment, rescheduleAppointment } from "../api/doctor/appointments"
import type { AppointmentWithDoctorAndPatient } from "../types"

export function useDoctorAppointments() {
    const qc = useQueryClient()

    const { data: appointments = [] } = useQuery<AppointmentWithDoctorAndPatient[]>({
        queryKey: ['doctorAppointments'],
        queryFn: listDoctorAppointments,
        staleTime: 0,
        gcTime: Infinity,
        refetchOnMount: true,
        refetchOnWindowFocus: true
    })

    const { mutateAsync: confirm } = useMutation({
        mutationFn: confirmAppointment,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['doctorAppointments'] })
        }
    })

    const { mutateAsync: reject } = useMutation({
        mutationFn: rejectAppointment,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['doctorAppointments'] })
        }
    })

    const { mutateAsync: reschedule } = useMutation({
        mutationFn: (payload: { id: number; date: string; timeSlot: string }) =>
            rescheduleAppointment(payload.id, { date: payload.date, timeSlot: payload.timeSlot }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['doctorAppointments'] })
        }
    })

    return {
        appointments,
        confirm,
        reject,
        reschedule
    }
}