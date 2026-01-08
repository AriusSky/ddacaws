import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDoctors } from '../../api/doctors'
import { createAppointment, getMyAppointments } from '../../api/appointments'
import { Button, MenuItem, Paper, TextField, Typography, Container, Stack } from '@mui/material'
import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import type { DoctorWithProfile } from '../../types'

export default function BookAppointment() {
    const location = useLocation() as any
    const initDoctorId = location.state?.doctorId ?? ''
    const { data: doctors = [] } = useQuery<DoctorWithProfile[]>({ 
        queryKey: ['doctors'], 
        queryFn: () => getDoctors() 
    })
    const { data: appointments = [] } = useQuery({ 
        queryKey: ['myAppointments'], 
        queryFn: () => getMyAppointments() 
    })
    const [doctorId, setDoctorId] = useState<number | ''>(initDoctorId)
    const [date, setDate] = useState('')
    const [timeSlot, setTimeSlot] = useState('')
    const [symptom, setSymptom] = useState('')
    const navigate = useNavigate()
    const qc = useQueryClient()

    // Error states
    const [errors, setErrors] = useState({
        doctorId: '',
        date: '',
        timeSlot: '',
        symptom: ''
    })

    // Validation functions
    const validateDoctorId = (value: number | ''): string => {
        if (!value) return 'Please select a doctor'
        return ''
    }

    const validateDate = (value: string): string => {
        if (!value) return 'Please select an appointment date'
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) return 'Cannot book appointments in the past'
        return ''
    }

    const validateTimeSlot = (value: string, selectedDoctorId: number | '', selectedDate: string): string => {
        if (!selectedDoctorId) return 'Please select a doctor first'
        if (!selectedDate) return 'Please select a date first'
        if (!value) return 'Please select a time slot'
        return ''
    }

    const validateSymptom = (value: string): string => {
        if (value.trim().length > 500) return 'Symptom description must be less than 500 characters'
        return ''
    }

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => createAppointment({ 
            doctorId: Number(doctorId), 
            date,
            timeSlot, 
            symptom: symptom || undefined
        }),
        onSuccess: async () => {
            toast.success('Appointment booked successfully')
            await qc.invalidateQueries({ queryKey: ['myAppointments'] })
            navigate('/appointments')
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || err?.response?.data || 'Failed to book appointment'
            toast.error(errorMessage)
        }
    })

    const timeSlots = [
        '09:00 AM - 09:30 AM',
        '09:30 AM - 10:00 AM',
        '10:00 AM - 10:30 AM',
        '10:30 AM - 11:00 AM',
        '11:00 AM - 11:30 AM',
        '11:30 AM - 12:00 PM',
        '02:00 PM - 02:30 PM',
        '02:30 PM - 03:00 PM',
        '03:00 PM - 03:30 PM',
        '03:30 PM - 04:00 PM',
        '04:00 PM - 04:30 PM',
        '04:30 PM - 05:00 PM',
        '05:00 PM - 05:30 PM',
        '05:30 PM - 06:00 PM'
    ]

    // Get booked time slots for the selected doctor on the selected appointmentDate
    const bookedSlots = appointments
        .filter(apt => apt.doctorId === Number(doctorId) && apt.appointmentDate === date && apt.status !== 'Cancelled')
        .map(apt => apt.timeSlot)

    // Available time slots are those not booked
    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot))

    // Validate all fields
    const formErrors = useMemo(() => {
        return {
            doctorId: validateDoctorId(doctorId),
            date: validateDate(date),
            timeSlot: validateTimeSlot(timeSlot, doctorId, date),
            symptom: validateSymptom(symptom)
        }
    }, [doctorId, date, timeSlot, symptom])

    // Check if form is valid
    const isFormValid = useMemo(() => {
        return (
            doctorId &&
            date &&
            timeSlot &&
            Object.values(formErrors).every(error => !error)
        )
    }, [doctorId, date, timeSlot, formErrors])

    const handleDoctorChange = (value: string) => {
        const numValue = Number(value) || ''
        setDoctorId(numValue)
        setErrors(prev => ({
            ...prev,
            doctorId: validateDoctorId(numValue),
            timeSlot: validateTimeSlot(timeSlot, numValue, date)
        }))
    }

    const handleDateChange = (value: string) => {
        setDate(value)
        setTimeSlot('') // Reset time slot when date changes
        setErrors(prev => ({
            ...prev,
            date: validateDate(value),
            timeSlot: validateTimeSlot('', doctorId, value)
        }))
    }

    const handleTimeSlotChange = (value: string) => {
        setTimeSlot(value)
        setErrors(prev => ({
            ...prev,
            timeSlot: validateTimeSlot(value, doctorId, date)
        }))
    }

    const handleSymptomChange = (value: string) => {
        setSymptom(value)
        setErrors(prev => ({
            ...prev,
            symptom: validateSymptom(value)
        }))
    }

    const handleSubmit = async () => {
        if (!isFormValid) {
            toast.error('Please fix the errors in the form')
            return
        }
        await mutateAsync()
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
                    Book an Appointment
                </Typography>

                <Stack spacing={2.5}>
                    <TextField
                        select
                        label="Select Doctor *"
                        fullWidth
                        value={doctorId}
                        onChange={e => handleDoctorChange(e.target.value)}
                        error={!!errors.doctorId}
                        helperText={errors.doctorId}
                    >
                        <MenuItem value="">
                            <em>Choose a doctor...</em>
                        </MenuItem>
                        {doctors.map(d => (
                            <MenuItem key={d.doctorId} value={d.doctorId}>
                                Dr. {d.profile.fullName} - {d.specialization}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        type='appointmentDate'
                        label='Appointment Date *'
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        value={date}
                        onChange={e => handleDateChange(e.target.value)}
                        error={!!errors.date}
                        helperText={errors.date}
                    />

                    <TextField
                        select
                        label="Time Slot *"
                        fullWidth
                        value={timeSlot}
                        onChange={e => handleTimeSlotChange(e.target.value)}
                        disabled={!date || !doctorId}
                        error={!!errors.timeSlot}
                        helperText={errors.timeSlot || (availableSlots.length === 0 && date && doctorId ? 'No available slots for this date' : '')}
                    >
                        <MenuItem value="">
                            <em>Choose a time...</em>
                        </MenuItem>
                        {availableSlots.length > 0 ? (
                            availableSlots.map(t => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                <em>{date && doctorId ? 'No available slots for this date' : 'Select doctor and date first'}</em>
                            </MenuItem>
                        )}
                    </TextField>

                    <TextField
                        label="Symptom Description (Optional)"
                        fullWidth
                        multiline
                        minRows={4}
                        maxRows={8}
                        placeholder="Describe your symptoms..."
                        value={symptom}
                        onChange={e => handleSymptomChange(e.target.value)}
                        error={!!errors.symptom}
                        helperText={errors.symptom || `${symptom.length}/500 characters`}
                    />

                    <Button
                        variant='contained'
                        size='large'
                        fullWidth
                        disabled={!isFormValid || isPending}
                        onClick={handleSubmit}
                        sx={{ py: 1.5 }}
                    >
                        {isPending ? 'Booking...' : 'Confirm Appointment'}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    )
}
