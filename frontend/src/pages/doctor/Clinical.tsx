import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {useRef, useState} from 'react';
import {
    issuePrescription,
    listDoctorMedicalRecords,
    listDoctorPrescriptions, recordHealthMetric,
    upsertMedicalRecord,
} from '../../api/doctor/clinical';
import {listAppointmentsForMedicalRecord} from '../../api/doctor/appointments';
import {deleteDocument, downloadDocument, uploadDocument} from '../../api/documents';
import DeleteIcon from '@mui/icons-material/Delete';
import {format} from 'date-fns';
import type {
    AppointmentWithDoctorAndPatient,
    MedicalRecordDetail,
    Attachment,
    PrescriptionDetail,
    PrescribedMedication, PrescriptionInput, HealthMetricInput,
} from '../../types';
import ConfirmationDialog from "../../component/ConfirmationDialog.tsx";
import axios from 'axios';
import {ExpandMore} from '@mui/icons-material';
import InfoTooltip from "../../component/InfoTooltip.tsx";

// Main component that either shows the list or the workspace
export default function DoctorClinical() {
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDoctorAndPatient | null>(null);

    if (selectedAppointment) {
        return (
            <ClinicalWorkspace
                appointment={selectedAppointment}
                onBack={() => setSelectedAppointment(null)}
            />
        );
    }

    return <AppointmentList onSelectAppointment={setSelectedAppointment}/>;
}

// Subcomponent for the appointment list view
function AppointmentList({
                             onSelectAppointment,
                         }: {
    onSelectAppointment: (appt: AppointmentWithDoctorAndPatient) => void;
}) {
    const {data: appointments = [], isLoading} = useQuery<AppointmentWithDoctorAndPatient[]>({
        queryKey: ['doctorAppointments'],
        queryFn: listAppointmentsForMedicalRecord,
    });

    if (isLoading) {
        return <CircularProgress/>;
    }

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Typography variant="h5" sx={{fontWeight: 600, mb: 3}}>
                Clinical Documentation
            </Typography>
            <Stack spacing={2}>
                {appointments.length === 0 ? (
                    <Paper sx={{p: 3, textAlign: 'center'}}>
                        <Typography color="text.secondary">No appointments to document.</Typography>
                    </Paper>
                ) : (
                    appointments.map(appt => (
                        <Paper key={appt.id}
                               sx={{p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    {appt.patient?.fullName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {format(new Date(appt.appointmentDate), 'MMM dd, yyyy')} • {appt.timeSlot}
                                </Typography>
                            </Box>
                            <Button variant="outlined" onClick={() => onSelectAppointment(appt)}>
                                View/Edit Notes
                            </Button>
                        </Paper>
                    ))
                )}
            </Stack>
        </Container>
    );
}

// Sub-component for the detailed workspace view
function ClinicalWorkspace({
                               appointment,
                               onBack,
                           }: {
    appointment: AppointmentWithDoctorAndPatient;
    onBack: () => void;
}) {
    const [activeTab, setActiveTab] = useState(0);

    // Fetch the medical record for this specific appointment
    const {data: medicalRecord = null, isLoading: isRecordLoading} = useQuery<MedicalRecordDetail | null>({
        queryKey: ['doctorMedicalRecord', appointment.id],
        queryFn: async () => {
            // We assume listDoctorMedicalRecords can be filtered by appointmentId,
            // or we find it from the full list.
            const allRecords = await listDoctorMedicalRecords();
            return allRecords.find(r => r.appointmentId === appointment.id) || null;
        },
    });

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Button onClick={onBack} sx={{mb: 2}}>
                &larr; Back to Appointment List
            </Button>
            <Paper sx={{p: 3, mb: 3}}>
                <Typography variant="h6">
                    Clinical Workspace for: <strong>{appointment.patient.fullName}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Appointment on {format(new Date(appointment.appointmentDate), 'PP')} at {appointment.timeSlot}
                </Typography>
            </Paper>

            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Diagnosis"/>
                    <Tab label="Attachments" disabled={!medicalRecord}/>
                    <Tab label="Prescriptions" disabled={!medicalRecord}/>
                    <Tab label="Record Vitals" />
                </Tabs>
            </Box>

            <Box sx={{pt: 3}}>
                {isRecordLoading ? (
                    <CircularProgress/>
                ) : (
                    <>
                        {activeTab === 0 && <DiagnosisTab appointment={appointment} record={medicalRecord}/>}
                        {activeTab === 1 && medicalRecord && <AttachmentsTab record={medicalRecord}/>}
                        {activeTab === 2 && medicalRecord && <PrescriptionsTab record={medicalRecord}/>}
                        {activeTab === 3 && <VitalsTab patientId={appointment.patient.id} />}
                    </>
                )}
            </Box>
        </Container>
    );
}

// Tab 1: Diagnosis & Treatment Plan
function DiagnosisTab({
                          appointment,
                          record,
                      }: {
    appointment: AppointmentWithDoctorAndPatient;
    record: MedicalRecordDetail | null;
}) {
    const qc = useQueryClient();
    const [diagnosis, setDiagnosis] = useState(record?.diagnosis || '');
    const [symptoms, setSymptoms] = useState(record?.symptoms || '');
    const [treatmentPlan, setTreatmentPlan] = useState(record?.treatmentPlan || '');

    const {mutate: saveRecord, isPending} = useMutation({
        mutationFn: () =>
            upsertMedicalRecord({
                recordId: record?.recordId,
                appointmentId: appointment.id,
                diagnosis: diagnosis,
                symptoms: symptoms,
                treatmentPlan: treatmentPlan,
                attachments: record?.attachments?.map(a => a.fileKey), // Preserve existing attachments
            }),
        onSuccess: () => {
            toast.success('Medical record saved successfully!');
            qc.invalidateQueries({queryKey: ['doctorMedicalRecord', appointment.id]});
        },
        onError: () => {
            toast.error('Failed to save medical record.');
        },
    });

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">Medical Record Notes</Typography>
                    <TextField
                        label="Observed Symptoms"
                        fullWidth
                        multiline
                        minRows={2}
                        value={symptoms}
                        onChange={e => setSymptoms(e.target.value)}
                    />
                    <TextField
                        label="Diagnosis"
                        fullWidth
                        multiline
                        minRows={3}
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                    />
                    <TextField
                        label="Treatment Plan"
                        fullWidth
                        multiline
                        minRows={4}
                        value={treatmentPlan}
                        onChange={e => setTreatmentPlan(e.target.value)}
                    />
                    <Button variant="contained" onClick={() => saveRecord()} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

// Tab 2: File Attachments
function AttachmentsTab({record}: { record: MedicalRecordDetail }) {
    const qc = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<Attachment[]>(record.attachments || []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<Attachment | null>(null);

    const {mutate: updateRecordAttachments, isPending: isUpdating} = useMutation({
        mutationFn: (newAttachments: Attachment[]) => {
            const attachmentKeys = newAttachments.map(a => a.fileKey);
            return upsertMedicalRecord({
                recordId: record.recordId,
                appointmentId: record.appointmentId,
                diagnosis: record.diagnosis,
                attachments: attachmentKeys,
                symptoms: record.symptoms,
                treatmentPlan: record.treatmentPlan
            });
        },
        onSuccess: () => {
            toast.success('Attachments updated!');
            qc.invalidateQueries({queryKey: ['doctorMedicalRecord', record.appointmentId]});
        },
        onError: () => {
            toast.error('Failed to update attachments.');
        }
    });

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            toast.info(`Uploading ${file.name}...`);
            const result = await uploadDocument(file);
            const newAttachment: Attachment = {
                fileKey: result.fileKey,
                fileName: file.name,
                downloadUrl: result.downloadUrl,
            };
            const newAttachments = [...attachments, newAttachment];
            setAttachments(newAttachments);
            updateRecordAttachments(newAttachments); // Auto-save on upload
        } catch (error) {
            toast.error('File upload failed.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openDeleteDialog = (file: Attachment) => {
        setFileToDelete(file);
        setDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setFileToDelete(null);
        setDialogOpen(false);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;

        const {fileKey} = fileToDelete;
        const previousAttachments = attachments;

        // Optimistically update UI
        const newAttachments = attachments.filter(a => a.fileKey !== fileKey);
        setAttachments(newAttachments);
        closeDeleteDialog();

        try {
            // Call API to delete from S3
            await deleteDocument(fileKey);
            // Call API to update the medical record's attachment list
            updateRecordAttachments(newAttachments);
            toast.success("Attachment removed successfully.");
        } catch (error) {
            toast.error("Failed to remove attachment.");
            // Revert UI state on failure
            setAttachments(previousAttachments);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{mb: 2}}>Attachments</Typography>
                <Stack spacing={1} sx={{mb: 2}}>
                    {attachments.map(file => (
                        <Paper key={file.fileKey} variant="outlined" sx={{p: 1}}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box sx={{flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    <Typography>{file.fileName}</Typography>
                                </Box>
                                <Button onClick={() => handleDownload(file)}>
                                    Download
                                </Button>
                                <IconButton size="small" onClick={() => openDeleteDialog(file)} disabled={isUpdating}>
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Stack>
                        </Paper>
                    ))}
                    {attachments.length === 0 &&
                        <Typography variant="body2" color="text.secondary">No attachments for this record.</Typography>}
                </Stack>
                <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload}/>
                <Button variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={isUpdating}>
                    Add New File
                </Button>
            </CardContent>
            <ConfirmationDialog
                open={dialogOpen}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
                title="Delete Attachment?"
                description={`You are about to permanently delete the file "${fileToDelete?.fileName}". This action cannot be undone.`}
            />
        </Card>
    );
}

// Tab 3: Prescriptions
function PrescriptionsTab({record}: { record: MedicalRecordDetail }) {
    const qc = useQueryClient();

    // State for the form
    const [medications, setMedications] = useState<PrescribedMedication[]>([
        {name: '', strength: '', dosageForm: '', quantity: '', directions: '', notes: ''}
    ]);
    const [generalInstructions, setGeneralInstructions] = useState('');

    // Fetch existing prescriptions for this record
    const {data: issuedPrescriptions = []} = useQuery<PrescriptionDetail[]>({
        queryKey: ['doctorPrescriptions', record.recordId],
        queryFn: async () => {
            const allPrescriptions = await listDoctorPrescriptions();
            return allPrescriptions.filter(p => p.recordId === record.recordId);
        }
    });

    const {mutate: issue, isPending} = useMutation({
        mutationFn: (prescriptionData: PrescriptionInput) => issuePrescription(prescriptionData),
        onSuccess: () => {
            toast.success('Prescription issued successfully!');
            // Reset the form to its initial state
            setMedications([{name: '', strength: '', dosageForm: '', quantity: '', directions: '', notes: ''}]);
            setGeneralInstructions('');
            // Refetch the list of issued prescriptions
            qc.invalidateQueries({queryKey: ['doctorPrescriptions', record.recordId]});
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to issue prescription.');
            } else {
                throw error;
            }
        }
    });

    const handleIssuePrescription = () => {
        const payload: PrescriptionInput = {
            recordId: record.recordId,
            medications: medications.filter(m => m.name.trim()), // Only include medications with a name
            generalInstructions: generalInstructions
        };
        if (payload.medications.length === 0) {
            toast.warn("Please add at least one medication.");
            return;
        }
        issue(payload);
    };

    const addMedicationRow = () => {
        setMedications(prev => [...prev, {
            name: '',
            strength: '',
            dosageForm: '',
            quantity: '',
            directions: '',
            notes: ''
        }]);
    };

    const removeMedicationRow = (index: number) => {
        setMedications(prev => prev.filter((_, idx) => idx !== index));
    };

    const updateMedicationField = (index: number, field: keyof PrescribedMedication, value: string) => {
        setMedications(prev => prev.map((med, idx) => (idx === index ? {...med, [field]: value} : med)));
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{mb: 2}}>Issue New Prescription</Typography>

                <Stack spacing={3}>
                    {medications.map((med, idx) => (
                        <Paper key={idx} variant="outlined" sx={{p: 2}}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" sx={{fontWeight: 600}}>Medication
                                        #{idx + 1}</Typography>
                                    {medications.length > 1 && (
                                        <IconButton color="error" size="small" onClick={() => removeMedicationRow(idx)}>
                                            <DeleteIcon fontSize="inherit"/>
                                        </IconButton>
                                    )}
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs:12, sm:6 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    Medication Name
                                                    <InfoTooltip
                                                        title="The trade or generic name of the drug (e.g., Amoxicillin)."/>
                                                </Box>
                                            }
                                            value={med.name}
                                            onChange={e => updateMedicationField(idx, 'name', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs:1, sm:2 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    Strength
                                                    <InfoTooltip
                                                        title="The amount of active ingredient in a single unit (e.g., 500mg)."/>
                                                </Box>
                                            }
                                            value={med.strength}
                                            onChange={e => updateMedicationField(idx, 'strength', e.target.value)}
                                            placeholder="e.g., 500mg"
                                        />
                                    </Grid>
                                    <Grid size={{ xs:1, sm:2 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    Form
                                                    <InfoTooltip
                                                        title="The dosage form (e.g., Tablet, Capsule, Cream)."/>
                                                </Box>
                                            }
                                            value={med.dosageForm}
                                            onChange={e => updateMedicationField(idx, 'dosageForm', e.target.value)}
                                            placeholder="e.g., Tablet"
                                        />
                                    </Grid>
                                    <Grid size={{ xs:1 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    Directions (SIG)
                                                    <InfoTooltip
                                                        title="The full instruction for the patient, including quantity per dose, route, frequency, and duration (e.g., 'Take 1 tablet by mouth twice daily for 7 days')."/>
                                                </Box>
                                            }
                                            value={med.directions}
                                            onChange={e => updateMedicationField(idx, 'directions', e.target.value)}
                                            placeholder="e.g., Take 1 tablet by mouth twice daily for 7 days"
                                        />
                                    </Grid>
                                    <Grid size={{ xs:1, sm:2 }}>
                                        <TextField
                                            fullWidth
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    Quantity to Dispense
                                                    <InfoTooltip
                                                        title="The total number of units the pharmacy should give the patient for the full course of treatment."/>
                                                </Box>
                                            }
                                            value={med.quantity}
                                            onChange={e => updateMedicationField(idx, 'quantity', e.target.value)}
                                            placeholder="e.g., 14 tablets"
                                        />
                                    </Grid>
                                    <Grid size={{ xs:1, sm:2 }}>
                                        <TextField
                                            fullWidth
                                            label="Notes (Optional)"
                                            value={med.notes || ''}
                                            onChange={e => updateMedicationField(idx, 'notes', e.target.value)}
                                            placeholder="e.g., Take with food"
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>

                <Button onClick={addMedicationRow} sx={{my: 2}}>Add Another Medication</Button>

                <TextField
                    label="General Instructions (Optional)"
                    fullWidth
                    multiline
                    minRows={2}
                    value={generalInstructions}
                    onChange={e => setGeneralInstructions(e.target.value)}
                    sx={{mt: 1, mb: 2}}
                />

                <Button
                    variant="contained"
                    onClick={handleIssuePrescription}
                    disabled={isPending || medications.every(m => !m.name.trim())}
                >
                    {isPending ? 'Issuing...' : 'Issue Prescription'}
                </Button>

                <Box sx={{mt: 4}}>
                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>Issued Prescriptions for this
                        Record</Typography>
                    {issuedPrescriptions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No prescriptions have been issued for this
                            record yet.</Typography>
                    ) : (
                        <Stack spacing={1}>
                            {issuedPrescriptions.map(p => (
                                <Accordion key={p.prescriptionId}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography sx={{width: '33%', flexShrink: 0}}>
                                            Rx #{p.prescriptionId}
                                        </Typography>
                                        <Typography sx={{color: 'text.secondary'}}>
                                            Issued: {format(new Date(p.issueDate), 'PP')} ({p.medications.length} medication(s))
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {p.medications.map((med, idx) => (
                                            <Box key={idx} sx={{borderBottom: 1, borderColor: 'divider', pb: 2, mb: 2}}>
                                                <Typography variant="body1"
                                                            sx={{fontWeight: 'bold'}}>{med.name} {med.strength} ({med.dosageForm})</Typography>
                                                <Typography variant="body2"
                                                            color="text.secondary"><strong>Directions:</strong> {med.directions}
                                                </Typography>
                                                <Typography variant="body2"
                                                            color="text.secondary"><strong>Quantity:</strong> {med.quantity}
                                                </Typography>
                                                {med.notes && <Typography variant="caption"
                                                                          color="text.secondary"><strong>Note:</strong> {med.notes}
                                                </Typography>}
                                            </Box>
                                        ))}
                                        {p.generalInstructions && (
                                            <>
                                                <Typography variant="subtitle2" sx={{mt: 2, fontWeight: 'bold'}}>General
                                                    Instructions</Typography>
                                                <Typography variant="body2">{p.generalInstructions}</Typography>
                                            </>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

function VitalsTab({ patientId }: { patientId: number }) {
    const [hr, setHr] = useState('');
    const [bpSys, setBpSys] = useState('');
    const [bpDia, setBpDia] = useState('');
    const [sugar, setSugar] = useState('');
    const [weight, setWeight] = useState('');
    const [temp, setTemp] = useState('');

    // You'll need to create this API function in your clinical.ts
    const { mutate: saveVitals, isPending } = useMutation({
        mutationFn: recordHealthMetric,
        onSuccess: () => {
            toast.success("Vitals recorded successfully!");
            // Clear the form
            setHr(''); setBpSys(''); setBpDia(''); setSugar(''); setWeight(''); setTemp('');
            // You could also refetch patient's vitals list here
        },
        onError: () => {
            toast.error("Failed to save vitals.");
        }
    });

    const handleSave = () => {
        const payload: HealthMetricInput = {
            patientId: patientId,
            heartRate: Number(hr) || 0,
            bloodPressureSystolic: Number(bpSys) || 0,
            bloodPressureDiastolic: Number(bpDia) || 0,
            bloodSugar: Number(sugar) || 0,
            weight: Number(weight) || 0,
            temperature: temp ? Number(temp) : undefined,
        };
        saveVitals(payload);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Record Vitals for this Encounter</Typography>
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6}}><TextField label="Heart Rate (bpm)" fullWidth value={hr} onChange={e => setHr(e.target.value)} type="number" /></Grid>
                    <Grid size={{xs:12, sm:6}}><TextField label="Weight (kg)" fullWidth value={weight} onChange={e => setWeight(e.target.value)} type="number" /></Grid>
                    <Grid size={{xs:6, sm:4}}><TextField label="BP Systolic (mmHg)" fullWidth value={bpSys} onChange={e => setBpSys(e.target.value)} type="number" /></Grid>
                    <Grid size={{xs:6, sm:4}}><TextField label="BP Diastolic (mmHg)" fullWidth value={bpDia} onChange={e => setBpDia(e.target.value)} type="number" /></Grid>
                    <Grid size={{xs:6, sm:4}}><TextField label="Temperature (°C)" fullWidth value={temp} onChange={e => setTemp(e.target.value)} type="number" /></Grid>
                    <Grid size={{xs:12, sm:6}}><TextField label="Blood Sugar (mmol/L)" fullWidth value={sugar} onChange={e => setSugar(e.target.value)} type="number" /></Grid>
                </Grid>
                <Button variant="contained" onClick={handleSave} disabled={isPending} sx={{ mt: 3 }}>
                    {isPending ? "Saving..." : "Save Vitals"}
                </Button>
            </CardContent>
        </Card>
    );
}
