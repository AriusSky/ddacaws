import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPatientRecords, getPatientVitals, listMyPatients } from "../../api/doctor/patients"
import { Box, Button, Paper, Typography, Container, Avatar, Divider, Stack, Card, CardContent } from '@mui/material'
import { format } from "date-fns"
import type { Profile, VitalRecord } from "../../types"

export default function DoctorPatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const patientId = Number(id)

    const { data: patients = [] } = useQuery({
        queryKey: ['doctorPatients'],
        queryFn: listMyPatients
    })

    const patient: Profile | undefined = patients.find(p => p.id === patientId)

    const { data: records = [] } = useQuery({
        queryKey: ['doctorPatientRecords', patientId],
        queryFn: () => getPatientRecords(patientId),
        enabled: !!patientId
    })

    const { data: vitals = [] } = useQuery<VitalRecord[]>({
        queryKey: ['doctorPatientVitals', patientId],
        queryFn: () => getPatientVitals(patientId),
        enabled: !!patientId
    })

    if (!patient) return null

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    <Avatar
                        alt={patient.fullName}
                        src={patient.avatarUrl}
                        sx={{
                            width: 200,
                            height: 200,
                            flexShrink: 0,
                            fontSize: '4rem'
                        }}
                    >
                        {patient.fullName.slice(0, 1)}
                    </Avatar>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                            {patient.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email: {patient.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Phone: {patient.phoneNumber ?? 'N/A'}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Medical Records
                </Typography>
                {records.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        No records yet.
                    </Typography>
                ) : (
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {records.map(r => (
                            <Card key={r.recordId} variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {r.diagnosis}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {r.createdAt ? format(new Date(r.createdAt), 'MMM dd, yyyy') : 'Unknown Date'} • Medical Record
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Treatment: {r.treatmentPlan}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Recent Vitals
                </Typography>
                {vitals.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        No vitals recorded.
                    </Typography>
                ) : (
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {vitals.map(v => (
                            <Card key={v.id} variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {new Date(v.recordedAt).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Heart Rate: {v.heartRate ?? '—'} bpm • Blood Pressure: {v.bloodPressure ?? '—'} • Temperature: {v.temperature ?? '—'}°C
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                </Box>
            </Paper>
        </Container>
    )
}
