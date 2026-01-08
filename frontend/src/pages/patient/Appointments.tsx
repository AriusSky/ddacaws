import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelAppointment, getMyAppointments } from '../../api/appointments'
import { Button, Chip, Paper, Stack, Typography, Container, Grid, Box, Menu, MenuItem } from '@mui/material'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { AppointmentWithDoctorAndPatient } from '../../types'

export default function Appointments() {
    const qc = useQueryClient()
    const { data = [] } = useQuery<AppointmentWithDoctorAndPatient[]>({ 
        queryKey: ['myAppointments'], 
        queryFn: getMyAppointments 
    })
    const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'doctor' | 'status'>('date-asc')
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (id: number) => cancelAppointment(id),
        onSuccess: async () => {
            toast.success('Appointment cancelled')
            await qc.invalidateQueries({ queryKey: ['myAppointments'] })
        },
        onError: () => {
            toast.error('Failed to cancel appointment')
        }
    })

    const getSortedAppointments = () => {
        const sorted = [...data]
        switch (sortBy) {
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
            case 'doctor':
                return sorted.sort((a, b) => a.doctor.profile.fullName.localeCompare(b.doctor.profile.fullName))
            case 'status':
                const statusOrder = { Pending: 0, Confirmed: 1, Completed: 2, Cancelled: 3 }
                return sorted.sort((a, b) => (statusOrder[a.status as keyof typeof statusOrder] ?? 4) - (statusOrder[b.status as keyof typeof statusOrder] ?? 4))
            default:
                return sorted
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return 'success'
            case 'Completed':
                return 'info'
            case 'Cancelled':
                return 'default'
            case 'Pending':
                return 'warning'
            default:
                return 'default'
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                    My Appointments
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant="outlined"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ textTransform: 'none' }}
                    >
                        Sort: {sortBy === 'date-asc' ? 'Earliest First' : sortBy === 'date-desc' ? 'Latest First' : sortBy === 'doctor' ? 'Doctor Name' : 'Status'}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem selected={sortBy === 'date-asc'} onClick={() => { setSortBy('date-asc'); setAnchorEl(null) }}>
                            📅 Earliest First (Upcoming)
                        </MenuItem>
                        <MenuItem selected={sortBy === 'date-desc'} onClick={() => { setSortBy('date-desc'); setAnchorEl(null) }}>
                            📅 Latest First (Past)
                        </MenuItem>
                        <MenuItem selected={sortBy === 'doctor'} onClick={() => { setSortBy('doctor'); setAnchorEl(null) }}>
                            👨‍⚕️ By Doctor Name
                        </MenuItem>
                        <MenuItem selected={sortBy === 'status'} onClick={() => { setSortBy('status'); setAnchorEl(null) }}>
                            📋 By Status (Pending → Completed)
                        </MenuItem>
                    </Menu>
                    <Button
                        component={Link}
                        to="/appointments/book"
                        variant='contained'
                    >
                        Book Appointment
                    </Button>
                </Stack>
            </Stack>

            <Stack spacing={2}>
                {data.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color='text.secondary'>
                            No appointments found.
                        </Typography>
                    </Paper>
                ) : (
                    getSortedAppointments().map(a => (
                        <Paper key={a.id} sx={{ p: 3, borderRadius: 4 }}>
                            {/* Doctor, Date & Time Row */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <Stack spacing={0.5}>
                                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                            Dr. {a.doctor.profile.fullName}
                                        </Typography>
                                        <Typography variant='body2' color='text.secondary'>
                                            {format(new Date(a.appointmentDate), 'MMM dd, yyyy')} • {a.timeSlot}
                                        </Typography>
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Stack direction='row' spacing={1} justifyContent='flex-end' alignItems='center'>
                                        <Chip 
                                            label={a.status} 
                                            color={getStatusColor(a.status) as any}
                                            variant="outlined"
                                            size='small'
                                        />
                                        {(a.status === 'Pending' || a.status === 'Confirmed') && (
                                            <Button
                                                size='small'
                                                color='error'
                                                variant='outlined'
                                                sx={{ 
                                                    borderRadius: 10,
                                                    padding: '4px 8px',
                                                    fontSize: '0.815rem',
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    minWidth: 'auto'
                                                }}
                                                disabled={isPending}
                                                onClick={() => mutateAsync(a.id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* Clinic Address */}
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                📍 {a.doctor.clinicAddress}
                            </Typography>

                            {/* Symptom, Notes, AI Analysis Stack */}
                            <Stack spacing={1.5} sx={{ mb: 2 }}>
                                {a.symptom && (
                                    <Box>
                                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Symptom
                                        </Typography>
                                        <Typography variant='body2'>
                                            {a.symptom}
                                        </Typography>
                                    </Box>
                                )}

                                {a.notes && (
                                    <Box>
                                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Notes
                                        </Typography>
                                        <Typography variant='body2'>
                                            {a.notes}
                                        </Typography>
                                    </Box>
                                )}

                                {a.aiAnalysis && (
                                    <Box>
                                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                                            AI Analysis
                                        </Typography>
                                        <Typography variant='body2'>
                                            {a.aiAnalysis}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

                            {a.cancellationReason && (
                                <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1 }}>
                                    <Typography variant='subtitle2' color='error' sx={{ fontWeight: 600 }}>
                                        Cancellation Reason
                                    </Typography>
                                    <Typography variant='body2' color='error'>
                                        {a.cancellationReason}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    ))
                )}
            </Stack>
        </Container>
    )
}
