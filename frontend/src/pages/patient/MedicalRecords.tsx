import {useQuery} from "@tanstack/react-query"
import {getMyRecords} from "../../api/medicalRecords"
import {Button, Paper, Stack, Typography, Container, Grid, Box, Chip} from "@mui/material"
import {format} from "date-fns"
import {toast} from "react-toastify"
import {Link} from "react-router-dom"
import type {MedicalRecordDetail} from "../../types"
import {AttachFile} from "@mui/icons-material"

export default function MedicalRecords() {
    const {data = []} = useQuery<MedicalRecordDetail[]>({
        queryKey: ['medicalRecords'],
        queryFn: getMyRecords
    })

    const handleDownload = async (id: number) => {
        try {
            const {downloadRecordPdf} = await import('../../api/medicalRecords')
            const blob = await downloadRecordPdf(id)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `medical-record-${id}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('Medical Record Started Downloading')
        } catch (error) {
            toast.error('Failed to download Medical Record')
        }
    }

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 3}}>
                <Typography variant="h5" sx={{fontWeigh: 600}}>
                    Medical Records
                </Typography>
            </Stack>

            <Stack spacing={2}>
                {data.length === 0 ? (
                    <Paper sx={{p: 3, textAlign: 'center'}}>
                        <Typography color="text.secondary">
                            No Medical Records found.
                        </Typography>
                    </Paper>
                ) : (
                    data.map(r => (
                        <Paper key={r.recordId} sx={{p: 3}}>
                            {/* Header: Doctor & Date */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Stack spacing={0.5}>
                                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                            Dr. {r.doctor?.fullName || 'Doctor'}
                                        </Typography>
                                        <Typography variant='body2' color='text.secondary'>
                                            {r.doctor?.specialization || ''}
                                        </Typography>
                                        <Typography variant='body2' color='text.secondary'>
                                            {format(new Date(r.createdAt), 'MMM dd, yyyy')}
                                        </Typography>
                                    </Stack>
                                </Grid>

                                <Grid size={{xs: 12, sm: 6}}>
                                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                        {r.attachments && r.attachments.length > 0 && (
                                            <Chip
                                                icon={<AttachFile/>}
                                                label={`${r.attachments.length} file(s)`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        <Button
                                            component={Link}
                                            to={`/records/${r.recordId}`}
                                            variant='outlined'
                                            size='small'
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant='outlined'
                                            size='small'
                                            onClick={() => handleDownload(r.recordId)}
                                        >
                                            Download
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* Diagnosis & Treatment */}
                            <Stack spacing={2} sx={{mb: 2}}>
                                <Box>
                                    <Typography variant='subtitle2' sx={{fontWeight: 600, mb: 0.5}}>
                                        Diagnosis
                                    </Typography>
                                    <Typography variant='body2'>
                                        {r.diagnosis}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant='subtitle2' sx={{fontWeight: 600, mb: 0.5}}>
                                        Treatment Plan
                                    </Typography>
                                    <Typography variant='body2'>
                                        {r.treatmentPlan || 'No treatment plan documented'}
                                    </Typography>
                                </Box>
                            </Stack>
                            {/* Blockchain Hash */}
                            {(r.blockchainHash) && (
                                <Box sx={{p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1}}>
                                    <Typography variant='caption' color='text.secondary' sx={{fontWeight: 600}}>
                                        Blockchain Hash
                                    </Typography>
                                    <Typography variant='caption' sx={{
                                        display: 'block',
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all'
                                    }}>
                                        {r.blockchainHash}
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
