import { Card, CardContent,  Typography, Stack, Paper, Button, Box, Avatar, Container, Dialog, DialogContent, TextField, DialogActions, MenuItem, Alert } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { listDoctorAppointmentsByStatus } from "../../api/doctor/appointments"
import { listMyPatients } from "../../api/doctor/patients"
import { useDoctorAppointments } from "../../query/doctorAppointments"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getIncomeStats } from '../../api/doctor/income'
import { toast } from "react-toastify"

export default function DoctorDashboard() {
    const navigate = useNavigate()
    const { confirm, reject, reschedule, appointments } = useDoctorAppointments()
    const [rescheduleOpen, setRescheduleOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [rescheduleDate, setRescheduleDate] = useState('')
    const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const today = new Date().toISOString().split('T')[0]

    const validateDate = (value: string): string => {
        if (!value) return 'Date is required'
        if (value < today) return 'Cannot reschedule to a past date'
        return ''
    }

    const validateTimeSlot = (value: string): string => {
        if (!value) return 'Time slot is required'
        const selectedAppointmentDate = selectedAppointment?.appointmentDate
            ? selectedAppointment.appointmentDate.split('T')[0]
            : ''
        if (value === selectedAppointment?.timeSlot && rescheduleDate === selectedAppointmentDate) {
            return 'Please select a different date or time'
        }
        return ''
    }

    const bookedSlots = useMemo(() => {
        if (!rescheduleDate || !selectedAppointment) return []
        return appointments
            .filter(apt => 
                apt.doctorId === selectedAppointment.doctorId && 
                apt.appointmentDate?.split('T')[0] === rescheduleDate && 
                apt.status !== 'Cancelled' &&
                apt.id !== selectedAppointment.id
            )
            .map(apt => apt.timeSlot)
    }, [rescheduleDate, selectedAppointment, appointments])

    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot))

    const formErrors = useMemo(() => {
        return {
            date: validateDate(rescheduleDate),
            timeSlot: validateTimeSlot(rescheduleTimeSlot)
        }
    }, [rescheduleDate, rescheduleTimeSlot, selectedAppointment])

    const isFormValid = useMemo(() => {
        return rescheduleDate && rescheduleTimeSlot && Object.values(formErrors).every(error => !error)
    }, [rescheduleDate, rescheduleTimeSlot, formErrors])

    const handleDateChange = (newDate: string) => {
        setRescheduleDate(newDate)
        setRescheduleTimeSlot('')
    }

    const handleTimeSlotChange = (newTimeSlot: string) => {
        setRescheduleTimeSlot(newTimeSlot)
    }
    
    const startReschedule = (appointment: any) => {
        setSelectedAppointment(appointment)
        setRescheduleDate(appointment.appointmentDate?.split('T')[0] ?? '')
        setRescheduleTimeSlot(appointment.timeSlot)
        setRescheduleOpen(true)
    }

    const submitReschedule = async () => {
        if (!isFormValid || !selectedAppointment) {
            toast.error('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)
        try {
            await reschedule({ id: selectedAppointment.id, date: rescheduleDate, timeSlot: rescheduleTimeSlot })
            toast.success('Appointment rescheduled successfully')
            setRescheduleOpen(false)
            setRescheduleDate('')
            setRescheduleTimeSlot('')
            setSelectedAppointment(null)
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

    const { data: confirmedAppointments = [] } = useQuery({
        queryKey: ['doctorAppointmentsByStatus', 'Confirmed'],
        queryFn: () => listDoctorAppointmentsByStatus('Confirmed')
    });

    const { data: pendingAppointments = [] } = useQuery({
        queryKey: ['doctorAppointmentsByStatus', 'Pending'],
        queryFn: () => listDoctorAppointmentsByStatus('Pending')
    });

    const { data: patients = [] } = useQuery({
        queryKey: ['doctorPatients'],
        queryFn: listMyPatients
    })

    const { data = [] } = useQuery({ queryKey: ['doctorIncome'], queryFn: getIncomeStats })
    const totalYtd = data.reduce((sum, item) => sum + item.total, 0)

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Dashboard
                    </Typography>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2, alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Appointments</Typography>
                        <Button
                            component={Link}
                            to="/doctor/appointments"
                            variant="outlined"
                            size="small"
                        >
                            View All
                        </Button>
                    </Stack>
                    <Stack spacing={2}>
                        {confirmedAppointments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No appointments scheduled
                            </Typography>
                        ) : (
                            confirmedAppointments.slice(0, 5).map((a) => (
                                <Paper
                                    key={a.id}
                                    sx={{
                                        p: 2,
                                        bgcolor: "background.default",
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            boxShadow: 2,
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                    onClick={() => navigate(`/doctor/appointments`)}
                                >
                                    <Avatar
                                        src={a.patient?.avatarUrl}
                                        alt={a.patient?.fullName}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            flexShrink: 0
                                        }}
                                    >
                                        {a.patient?.fullName.slice(0, 1)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {a.patient?.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(a.appointmentDate), "MMM dd, yyyy")} • {a.timeSlot}
                                        </Typography>
                                        {a.symptom && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {a.symptom}
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            ))
                        )}
                        {confirmedAppointments.length > 5 && (
                            <Button
                                component={Link}
                                to="/doctor/appointments"
                                variant="outlined"
                                fullWidth
                            >
                                View All Appointments
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2, alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Pending Confirmation</Typography>
                        <Button
                            component={Link}
                            to="/doctor/appointments"
                            variant="outlined"
                            size="small"
                        >
                            View All
                        </Button>
                    </Stack>
                    <Stack spacing={2}>
                        {pendingAppointments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No appointments scheduled
                            </Typography>
                        ) : (
                            pendingAppointments.slice(0, 5).map((a) => (
                                <Paper
                                    key={a.id}
                                    sx={{
                                        p: 2,
                                        bgcolor: "background.default",
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Avatar
                                        src={a.patient?.avatarUrl}
                                        alt={a.patient?.fullName}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            flexShrink: 0
                                        }}
                                    >
                                        {a.patient?.fullName.slice(0, 1)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {a.patient?.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(a.appointmentDate), "MMM dd, yyyy")} • {a.timeSlot}
                                        </Typography>
                                        {a.symptom && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {a.symptom}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
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
                                    </Stack>
                                </Paper>
                            ))
                        )}
                        {pendingAppointments.length > 5 && (
                            <Button
                                component={Link}
                                to="/doctor/appointments"
                                variant="outlined"
                                fullWidth
                            >
                                View All Appointments
                            </Button>
                        )}
                    </Stack>
                </Paper>

                {/* Patients Section */}
                <Paper sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2, alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>My Patients</Typography>
                        <Button
                            component={Link}
                            to="/doctor/patients"
                            variant="outlined"
                            size="small"
                        >
                            View All
                        </Button>
                    </Stack>
                    <Stack spacing={2}>
                        {patients.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No patients yet
                            </Typography>
                        ) : (
                            patients.slice(0, 5).map((p) => (
                                <Paper
                                    key={p.id}
                                    sx={{
                                        p: 2,
                                        bgcolor: "background.default",
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            boxShadow: 2,
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                    onClick={() => navigate(`/doctor/patient/${p.id}`)}
                                >
                                    <Avatar
                                        src={p.avatarUrl}
                                        alt={p.fullName}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            flexShrink: 0
                                        }}
                                    >
                                        {p.fullName.slice(0, 1)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {p.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {p.email}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {p.phoneNumber}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))
                        )}
                        {patients.length > 5 && (
                            <Button
                                component={Link}
                                to="/doctor/patients"
                                variant="outlined"
                                fullWidth
                            >
                                View All Patients
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>Income Overview</Typography>
                            <Typography variant="h4" sx={{ mb: 3 }}>${totalYtd.toLocaleString()}</Typography>
                            <div style={{ height: 320 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                        <Area type="monotone" dataKey="total" stroke="#1976d2" fillOpacity={1} fill="url(#incomeColor)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </Paper>
            </Stack>

            {/* Reschedule Dialog */}
            <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={2}>
                        {bookedSlots.length > 0 && (
                            <Alert severity="info">
                                {bookedSlots.length} slot(s) already booked on {rescheduleDate ? format(new Date(rescheduleDate), 'MMM dd, yyyy') : 'selected date'}
                            </Alert>
                        )}
                        {availableSlots.length === 0 && rescheduleDate && (
                            <Alert severity="warning">
                                No available time slots on this date
                            </Alert>
                        )}
                        <TextField 
                            type="date" 
                            label="New Date *" 
                            InputLabelProps={{ shrink: true }} 
                            fullWidth 
                            value={rescheduleDate} 
                            onChange={e => handleDateChange(e.target.value)}
                            error={!!formErrors.date}
                            helperText={formErrors.date}
                            inputProps={{ min: today }}
                        />
                        <TextField 
                            select
                            label="New Time Slot *" 
                            fullWidth 
                            value={rescheduleTimeSlot} 
                            onChange={e => handleTimeSlotChange(e.target.value)}
                            disabled={!rescheduleDate || availableSlots.length === 0}
                            error={!!formErrors.timeSlot}
                            helperText={formErrors.timeSlot || (availableSlots.length === 0 && rescheduleDate ? 'No available slots for this date' : 'Showing available slots only')}
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
                                    <em>{rescheduleDate ? 'No available slots for this date' : 'Select date first'}</em>
                                </MenuItem>
                            )}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRescheduleOpen(false)} disabled={isSubmitting}>Cancel</Button>
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
