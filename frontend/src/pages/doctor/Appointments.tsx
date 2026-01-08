import { Paper, Stack, Typography, Button, Chip, Dialog, DialogContent, TextField, DialogActions, Container, Grid, Box, MenuItem, Alert } from "@mui/material"
import { useState, useMemo } from "react"
import { useDoctorAppointments } from '../../query/doctorAppointments'
import { format } from "date-fns"
import { toast } from "react-toastify"

export default function DoctorAppointments() {
    const { appointments, confirm, reject, reschedule } = useDoctorAppointments()
    const [open, setOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [date, setDate] = useState('')
    const [timeSlot, setTimeSlot] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({
        date: '',
        timeSlot: ''
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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Validate date
    const validateDate = (value: string): string => {
        if (!value) return 'Date is required'
        if (value < today) return 'Cannot reschedule to a past date'
        return ''
    }

    // Validate time slot
    const validateTimeSlot = (value: string): string => {
        if (!value) return 'Time slot is required'
        if (value === selectedAppointment?.timeSlot && date === selectedAppointment?.date) {
            return 'Please select a different date or time'
        }
        return ''
    }

    // Get booked time slots for this doctor on the selected date
    const bookedSlots = useMemo(() => {
        if (!date || !selectedAppointment) return []
        return appointments
            .filter(apt => 
                apt.doctorId === selectedAppointment.doctorId && 
                apt.appointmentDate === date &&
                apt.status !== 'Cancelled' &&
                apt.id !== selectedAppointment.id // Exclude the current appointment being rescheduled
            )
            .map(apt => apt.timeSlot)
    }, [date, selectedAppointment, appointments])

    // Available time slots are those not booked
    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot))

    // Compute form validity
    const formErrors = useMemo(() => {
        return {
            date: validateDate(date),
            timeSlot: validateTimeSlot(timeSlot)
        }
    }, [date, timeSlot, selectedAppointment])

    const isFormValid = useMemo(() => {
        return date && timeSlot && Object.values(formErrors).every(error => !error)
    }, [date, timeSlot, formErrors])

    const handleDateChange = (newDate: string) => {
        setDate(newDate)
        setTimeSlot('') // Reset time slot when date changes
        setErrors(prev => ({
            ...prev,
            date: validateDate(newDate),
            timeSlot: ''
        }))
    }

    const handleTimeSlotChange = (newTimeSlot: string) => {
        setTimeSlot(newTimeSlot)
        setErrors(prev => ({
            ...prev,
            timeSlot: validateTimeSlot(newTimeSlot)
        }))
    }

    const startReschedule = (appointment: any) => {
        setSelectedAppointment(appointment)
        setSelectedId(appointment.id)
        setDate(appointment.appointmentDate)
        setTimeSlot(appointment.timeSlot)
        setErrors({ date: '', timeSlot: '' })
        setOpen(true)
    }

    const submitReschedule = async () => {
        if (!isFormValid || !selectedId) {
            toast.error('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)
        try {
            await reschedule({ id: selectedId, date, timeSlot })
            toast.success('Appointment rescheduled successfully')
            setOpen(false)
            setDate('')
            setTimeSlot('')
            setSelectedAppointment(null)
            setSelectedId(null)
            setErrors({ date: '', timeSlot: '' })
        } catch (error: any) {
            let errorMessage = 'Failed to reschedule appointment'
            if (error?.message) {
                errorMessage = error.message
            }
            toast.error(errorMessage)
            console.error('Reschedule error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return 'success'
            case 'Cancelled':
                return 'error'
            case 'Completed':
                return 'info'
            default:
                return 'warning'
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                My Appointments
            </Typography>

            <Stack spacing={2}>
                {appointments.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No appointments scheduled
                        </Typography>
                    </Paper>
                ) : (
                    appointments.map(a => (
                        a.patient ? (
                        <Paper key={a.id} sx={{ p: 3 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {a.patient.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(a.appointmentDate), 'MMM dd, yyyy')} • {a.timeSlot}
                                        </Typography>
                                        {a.symptom && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Symptom: {a.symptom}
                                                </Typography>
                                            </Box>
                                        )}
                                        {a.aiAnalysis && (
                                            <Box>
                                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                    AI Analysis: {a.aiAnalysis}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                                        <Chip 
                                            label={a.status} 
                                            color={getStatusColor(a.status) as any}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                {a.status === 'Pending' && (
                                    <>
                                        <Button 
                                            size="small" 
                                            variant="contained"
                                            onClick={() => confirm(a.id)}
                                        >
                                            Confirm
                                        </Button>
                                        <Button 
                                            size="small" 
                                            color="error"
                                            variant="outlined"
                                            onClick={() => reject(a.id)}
                                        >
                                            Reject
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="outlined"
                                            onClick={() => startReschedule(a)}
                                        >
                                            Reschedule
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        </Paper>
                        ) : null
                    ))
                )}
            </Stack>

            {/* Reschedule Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={2}>
                        {bookedSlots.length > 0 && (
                            <Alert severity="info">
                                {bookedSlots.length} slot(s) already booked on {date ? format(new Date(date), 'MMM dd, yyyy') : 'selected date'}
                            </Alert>
                        )}
                        {availableSlots.length === 0 && date && (
                            <Alert severity="warning">
                                No available time slots on this date
                            </Alert>
                        )}
                        <TextField 
                            type="appointmentDate" 
                            label="New Date *" 
                            InputLabelProps={{ shrink: true }} 
                            fullWidth 
                            value={date} 
                            onChange={e => handleDateChange(e.target.value)}
                            error={!!errors.date}
                            helperText={errors.date}
                            inputProps={{ min: today }}
                        />
                        <TextField 
                            select
                            label="New Time Slot *" 
                            fullWidth 
                            value={timeSlot} 
                            onChange={e => handleTimeSlotChange(e.target.value)}
                            disabled={!date || availableSlots.length === 0}
                            error={!!errors.timeSlot}
                            helperText={errors.timeSlot}
                        >
                            <MenuItem value="">
                                <em>Choose a time...</em>
                            </MenuItem>
                            {availableSlots.map(t => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))}
                            {availableSlots.length === 0 && date && (
                                <MenuItem disabled>
                                    <em>No available slots for this appointmentDate</em>
                                </MenuItem>
                            )}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button 
                        onClick={submitReschedule} 
                        variant="contained" 
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}
