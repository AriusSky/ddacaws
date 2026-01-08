import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getDoctor } from "../../api/doctors"
import { Box, Button, Paper, Typography, Container, Avatar, Rating, Divider, Grid } from '@mui/material'
import { useNavigate } from "react-router-dom"

export default function DoctorDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data } = useQuery({ 
        queryKey: ['doctor', id], 
        queryFn: () => getDoctor(Number(id)), 
        enabled: !!id 
    })

    if (!data) return null

    return (
        <Container maxWidth="lg" sx={{ my: 5 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    <Avatar
                        src={data.profile?.avatarUrl}
                        alt={data.profile?.fullName}
                        sx={{
                            width: 250,
                            height: 250,
                            flexShrink: 0,
                            m: 2
                        }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                            {data.profile?.fullName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Rating value={data.rating ?? 0} precision={0.1} readOnly />
                            <Typography variant="body2" color="text.secondary">
                                ({data.totalReviews ?? 0} reviews)
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            {data.specialization}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {data.biography ?? 'No biography provided.'}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                            License Number
                        </Typography> 
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {data.licenseNumber}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                            Years of Experience
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {data.yearsOfExperience} years
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                            Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {data.profile?.phoneNumber}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                            Consultation Fee
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            ${data.consultationFee.toFixed(2)}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/appointments/book', { state: { doctorId: data.doctorId } })}
                    >
                        Book Appointment
                    </Button>
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
