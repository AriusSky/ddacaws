import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { downloadRecordPdf, getRecord } from "../../api/medicalRecords"
import { Button, Paper, Typography, Container, Stack, Grid, Card, CardContent, Box, Divider } from '@mui/material'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { useEffect } from "react"
import type {Attachment, MedicalRecordDetail} from "../../types"
import {downloadDocument} from "../../api/documents.ts";
import { AttachFile } from "@mui/icons-material"

export default function MedicalRecordDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data } = useQuery<MedicalRecordDetail>({ 
        queryKey: ['record', id], 
        queryFn: () => getRecord(Number(id)), 
        enabled: !!id 
    })

    const handleDownload = async (attachment: Attachment) => {
        try {
            toast.info(`Downloading ${attachment.fileName}...`);

            // 1. Call our authenticated API function to get the file blob
            const blob = await downloadDocument(attachment.fileKey);

            // 2. Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // 3. Create a temporary, hidden link element
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = attachment.fileName; // Use the original filename

            // 4. Append the link to the body, click it, then remove it
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Download complete!");

        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download the file.");
        }
    };

    useEffect(() => {
        console.log('Medical record data:', data)
    }, [data])

    if (!data) return null
    
    const onDownload = async () => {
        try {
            const blob = await downloadRecordPdf(data.recordId)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `medical-record-${data.recordId}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('Record downloaded successfully')
        } catch (error) {
            toast.error('Failed to download record')
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                {/* Header Section */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Medical Record #{data.recordId}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button 
                            variant="contained" 
                            onClick={onDownload}
                        >
                            Download PDF
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/records')}
                        >
                            Back to Records
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Doctor & Patient Info */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
                                Doctor
                            </Typography>
                            {data.doctor ? (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        Dr. {data.doctor.fullName || 'Unknown'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {data.doctor.specialization || 'N/A'}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body1">No doctor information</Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
                                Date
                            </Typography>
                            <Typography variant="body1">
                                {data.createdAt ? format(new Date(data.createdAt), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Diagnosis & Treatment */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Diagnosis
                        </Typography>
                        <Typography variant="body1">
                            {data.diagnosis || 'No diagnosis recorded'}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Treatment Plan
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {data.treatmentPlan || 'No treatment plan documented'}
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Vital Signs & Lab Reports */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                                Appointment Notes
                            </Typography>
                            <Typography variant="body2">
                                {data.appointment?.notes || 'No additional notes'}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                                AI Analysis
                            </Typography>
                            <Typography variant="body2">
                                {data.appointment?.aiAnalysis || 'No AI analysis available'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />
                {/* Attachments */}

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Attachments
                </Typography>
                {data.attachments && data.attachments.length > 0 ? (
                    <Stack spacing={2}>
                        {data.attachments.map(att => (
                            <Paper key={att.fileKey} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachFile sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body1">
                                        {att.fileName}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleDownload(att)}
                                >
                                    Download
                                </Button>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No documents are attached to this record.
                    </Typography>
                )}
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Prescriptions Issued
                </Typography>
                {data.prescriptions && data.prescriptions.length > 0 ? (
                    <Stack spacing={2}>
                        {data.prescriptions.map(rx => (
                            <Paper key={rx.prescriptionId} variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Rx #{rx.prescriptionId} - {rx.medications.map(m => m.name).join(', ')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Issued on: {format(new Date(rx.issueDate), 'PP')}
                                </Typography>
                                <Button
                                    component={Link}
                                    to={`/prescriptions/${rx.prescriptionId}`} // Link to the detailed prescription page
                                    size="small"
                                    sx={{ mt: 1 }}
                                >
                                    View Full Details
                                </Button>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No prescriptions were issued for this record.
                    </Typography>
                )}
                <Divider sx={{ my: 3 }} />
                {/* Blockchain Info */}
                {(data.blockchainHash) && (
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mt: 3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Blockchain Hash (Verification)
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                display: 'block', 
                                fontFamily: 'monospace', 
                                wordBreak: 'break-all',
                                mt: 0.5
                            }}
                        >
                            {data.blockchainHash}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    )
}
