import {useParams, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {getPrescription} from '../../api/prescriptions'; // You already have this API function
import {
    Container,
    Paper,
    Typography,
    CircularProgress,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Divider,
} from '@mui/material';
import {format} from 'date-fns';
import type {PrescriptionDetail} from '../../types';

export default function PrescriptionDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {data: prescription, isLoading} = useQuery<PrescriptionDetail>({
        queryKey: ['prescription', id],
        queryFn: () => getPrescription(id!), // The '!' asserts that id is not undefined here
        enabled: !!id, // Only run the query if the id exists
    });

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!prescription) {
        return (
            <Container maxWidth="sm" sx={{py: 4, textAlign: 'center'}}>
                <Typography variant="h6">Prescription not found.</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Paper sx={{p: 4}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 3}}>
                    <Typography variant="h5" sx={{fontWeight: 600}}>
                        Prescription Details (Rx #{prescription.prescriptionId})
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </Stack>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid size={{xs: 12, sm: 6}}>
                        <Typography variant="subtitle2" color="text.secondary">Issued By</Typography>
                        <Typography variant="body1">Dr. {prescription.doctorName}</Typography>
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <Typography variant="subtitle2" color="text.secondary">Date Issued</Typography>
                        <Typography variant="body1">{format(new Date(prescription.issueDate), 'PPpp')}</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{my: 2}}/>

                <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                    Medications
                </Typography>
                <Stack spacing={2}>
                    {prescription.medications.map((med, idx) => (
                        <Card key={idx} variant="outlined">
                            <CardContent>
                                <Typography variant="h6" sx={{mb: 1}}>{med.name} {med.strength}</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <Typography variant="caption" color="text.secondary">Form</Typography>
                                        <Typography>{med.dosageForm}</Typography>
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <Typography variant="caption" color="text.secondary">Quantity</Typography>
                                        <Typography>{med.quantity}</Typography>
                                    </Grid>
                                    <Grid size={{xs: 12}}>
                                        <Typography variant="caption" color="text.secondary">Directions
                                            (SIG)</Typography>
                                        <Typography sx={{fontWeight: 500}}>{med.directions}</Typography>
                                    </Grid>
                                    {med.notes && (
                                        <Grid size={{xs: 12}}>
                                            <Typography variant="caption" color="text.secondary">Notes</Typography>
                                            <Typography>{med.notes}</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>

                {prescription.generalInstructions && (
                    <>
                        <Divider sx={{my: 3}}/>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>General Instructions</Typography>
                        <Typography variant="body1">{prescription.generalInstructions}</Typography>
                    </>
                )}
            </Paper>
        </Container>
    );
}
