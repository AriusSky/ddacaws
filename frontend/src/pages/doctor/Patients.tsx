import { Avatar, Card, CardContent, Stack, Typography, Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listMyPatients } from '../../api/doctor/patients'

export default function DoctorPatients() {
    const { data: patients = [] } = useQuery({ queryKey: ['doctorPatients'], queryFn: listMyPatients })
    const navigate = useNavigate()

    return (
        <Stack spacing={2}>
            {patients.map(p => (
                <Card 
                    key={p.id} 
                    sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
                            bgcolor: 'action.hover'
                        }
                    }} 
                    onClick={() => navigate(`/doctor/patient/${p.id}`)}
                >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            src={p.avatarUrl}
                            sx={{
                                width: 80,
                                height: 80,
                                flexShrink: 0,
                                fontSize: '2rem'
                            }}
                        >
                            {p.fullName.slice(0, 1)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {p.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {p.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Phone: {p.phoneNumber ?? '—'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    )
}

