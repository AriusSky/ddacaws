import { useQuery } from '@tanstack/react-query'
import { getDoctors } from '../../api/doctors'
import { Card, CardContent, Grid, Rating, TextField, Typography, Box, Avatar, Container } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DoctorWithProfile } from '../../types'

export default function Doctors() {
    const { data = [] } = useQuery<DoctorWithProfile[]>({
        queryKey: ['doctors'],
        queryFn: () => getDoctors()
    })
    const [q, setQ] = useState('')
    const navigate = useNavigate()

    const filtered = useMemo(() => data.filter(d => {
        const fullName = d.profile?.fullName || ''
        return fullName.toLowerCase().includes(q.toLowerCase()) ||
            d.specialization.toLowerCase().includes(q.toLowerCase())
    }), [data, q])

    return (
        <Container maxWidth="lg">
            <Typography variant='h4' sx={{ fontWeight: 600, mt: 4, mb: 4 }}>
                    Doctors
                </Typography>
            <TextField
                placeholder='Search by name or specialization...'
                fullWidth
                sx={{ mb: 2 }}
                value={q}
                onChange={e => setQ(e.target.value)}
            />
            <Grid container spacing={2}>
                {filtered.map(d => (
                    <Grid size={{ xs: 12, md: 6 }} key={d.doctorId}>
                        <Card
                            onClick={() => navigate(`/doctors/${d.doctorId}`)}
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                transition: 'box-shadow 0.3s ease',
                                '&:hover': {
                                    boxShadow: 6
                                }
                            }}
                        >
                            <Avatar
                                src={d.profile?.avatarUrl}
                                alt={d.profile?.fullName}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    flexShrink: 0,
                                    m: 2
                                }}
                            />
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                    {d.profile?.fullName}
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                    {d.specialization}
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                    {d.yearsOfExperience} years of practice
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Rating
                                        value={d.rating ?? 0}
                                        readOnly
                                        size='small'
                                    />
                                    <Typography variant='body2' color='text.secondary'>
                                        ({d.totalReviews ?? 0} reviews)
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}