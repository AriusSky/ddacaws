import {useQuery} from '@tanstack/react-query';
import {getMyPrescriptions} from '../../api/prescriptions';
import {Paper, Stack, Typography, Container, Grid, Box, Card, CardContent, Chip} from '@mui/material';
import {format} from 'date-fns';
import type {PrescriptionDetail} from '../../types';

export default function Prescriptions() {
    const {data: prescriptions = []} = useQuery<PrescriptionDetail[]>({
        queryKey: ['myPrescriptions'],
        queryFn: getMyPrescriptions
    });

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Typography variant='h5' sx={{fontWeight: 600, mb: 3}}>
                My Prescriptions
            </Typography>

            <Stack spacing={2}>
                {prescriptions.length === 0 ? (
                    <Paper sx={{p: 3, textAlign: 'center'}}>
                        <Typography color='text.secondary'>
                            No prescriptions found.
                        </Typography>
                    </Paper>
                ) : (
                    prescriptions.map(p => {
                        return (
                            <Paper key={p.prescriptionId} sx={{p: 3}}>
                                {/* Header: Doctor & Status */}
                                <Grid container spacing={2} sx={{mb: 2}}>
                                    <Grid size={{xs: 1, sm: 2}}>
                                        <Stack spacing={0.5}>
                                            <Typography variant='h6' sx={{fontWeight: 600}}>
                                                Dr. {p.doctorName}
                                            </Typography>
                                            <Typography variant='body2' color='text.secondary'>
                                                Issued: {format(new Date(p.issueDate), 'MMM dd, yyyy')}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{xs: 1, sm: 2}}>
                                        <Stack direction='row' spacing={1} justifyContent='flex-end'> </Stack>
                                    </Grid>
                                </Grid>

                                {/* General Instructions */}
                                {p.generalInstructions && (
                                    <Typography variant='body2' sx={{mb: 2, fontStyle: 'italic'}}>
                                        {p.generalInstructions}
                                    </Typography>
                                )}

                                {/* Medications */}
                                <Stack spacing={1.5}>
                                    <Typography variant='subtitle2' sx={{fontWeight: 600}}>
                                        Medications
                                    </Typography>
                                    {/* The parsing is gone! p.medications is now a clean array. */}
                                    {p.medications.map((med, idx) => (
                                        <Card key={`${p.prescriptionId}-${idx}`} variant='outlined'>
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid size={{xs: 1, sm: 2}}>
                                                        <Typography variant='body1'
                                                                    sx={{fontWeight: 600}}>{med.name}</Typography>
                                                        <Typography variant='body2'
                                                                    color='text.secondary'>{med.strength} - {med.dosageForm}</Typography>
                                                    </Grid>
                                                    <Grid size={{xs: 1, sm: 2}}>
                                                        <Typography variant='body2'
                                                                    sx={{fontWeight: 500}}>{med.directions}</Typography>
                                                    </Grid>
                                                    <Grid size={{xs: 1, sm: 2}}>
                                                        <Typography variant='body2'
                                                                    color='text.secondary'>Quantity: {med.quantity}</Typography>
                                                    </Grid>
                                                    {med.notes && (
                                                        <Grid size={{xs: 1}}>
                                                            <Typography variant='caption'
                                                                        color='text.secondary'>Note: {med.notes}</Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>

                                {p.blockchainHash && (
                                    <Box sx={{p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, mt: 3}}>
                                        <Typography variant='caption' color='text.secondary' sx={{fontWeight: 600}}>Blockchain
                                            Hash</Typography>
                                        <Typography variant='caption' sx={{
                                            display: 'block',
                                            fontFamily: 'monospace',
                                            wordBreak: 'break-all'
                                        }}>{p.blockchainHash}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })
                )}
            </Stack>
        </Container>
    );
}
