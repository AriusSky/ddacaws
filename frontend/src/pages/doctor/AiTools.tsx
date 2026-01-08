import { Box, Button, Card, CardContent, Chip, Stack, TextField, Typography, CircularProgress, Alert } from '@mui/material'
import { useState } from 'react'
import { 
    checkDrugInteractions, 
    getMedicationSuggestions, 
    getSimilarCases,
    identifyMedicineFromImage,
    interpretMedicalReport,
    type CaseRecommendation,
    type MedicationSuggestion,
    type DrugInteraction,
    type MedicineIdentificationResult,
    type ReportInterpretationResult
} from '../../api/doctor/ai'

export default function DoctorAiTools() {
    // Similar Cases
    const [symptom, setSymptom] = useState('')
    const [cases, setCases] = useState<CaseRecommendation[]>([])
    const [casesLoading, setCasesLoading] = useState(false)
    const [casesError, setCasesError] = useState('')

    // Medication Suggestions
    const [diagnosis, setDiagnosis] = useState('')
    const [medSuggestions, setMedSuggestions] = useState<MedicationSuggestion[]>([])
    const [medsLoading, setMedsLoading] = useState(false)
    const [medsError, setMedsError] = useState('')

    // Drug Interactions
    const [drugInput, setDrugInput] = useState('')
    const [interactions, setInteractions] = useState<DrugInteraction[]>([])
    const [interactionsLoading, setInteractionsLoading] = useState(false)
    const [interactionsError, setInteractionsError] = useState('')

    // Medicine Identification
    const [medicineResult, setMedicineResult] = useState<MedicineIdentificationResult | null>(null)
    const [medicineLoading, setMedicineLoading] = useState(false)
    const [medicineError, setMedicineError] = useState('')

    // Report Interpretation
    const [reportText, setReportText] = useState('')
    const [reportResult, setReportResult] = useState<ReportInterpretationResult | null>(null)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportError, setReportError] = useState('')

    const analyzeCases = async () => {
        if (!symptom.trim()) return
        try {
            setCasesLoading(true)
            setCasesError('')
            const res = await getSimilarCases(symptom.trim())
            setCases(res)
        } catch (err) {
            setCasesError('Failed to analyze cases')
            console.error(err)
        } finally {
            setCasesLoading(false)
        }
    }

    const fetchMedSuggestions = async () => {
        if (!diagnosis.trim()) return
        try {
            setMedsLoading(true)
            setMedsError('')
            const res = await getMedicationSuggestions(diagnosis.trim())
            setMedSuggestions(res)
        } catch (err) {
            setMedsError('Failed to fetch suggestions')
            console.error(err)
        } finally {
            setMedsLoading(false)
        }
    }

    const checkInteractions = async () => {
        const drugs = drugInput.split(',').map(s => s.trim()).filter(Boolean)
        if (!drugs.length) return
        try {
            setInteractionsLoading(true)
            setInteractionsError('')
            const res = await checkDrugInteractions(drugs)
            console.log('Drug interactions response:', res)
            // Ensure res is always an array
            const interactionsArray = Array.isArray(res) ? res : []
            setInteractions(interactionsArray)
            if (interactionsArray.length === 0) {
                setInteractionsError('No interactions found')
            }
        } catch (err) {
            setInteractionsError('Failed to check interactions')
            console.error(err)
        } finally {
            setInteractionsLoading(false)
        }
    }

    const handleMedicineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64 = event.target?.result as string
            
            try {
                setMedicineLoading(true)
                setMedicineError('')
                const res = await identifyMedicineFromImage(base64)
                setMedicineResult(res)
            } catch (err) {
                setMedicineError('Failed to identify medicine')
                console.error(err)
            } finally {
                setMedicineLoading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const interpretReport = async () => {
        if (!reportText.trim()) return
        try {
            setReportLoading(true)
            setReportError('')
            const res = await interpretMedicalReport(reportText)
            setReportResult(res)
        } catch (err) {
            setReportError('Failed to interpret report')
            console.error(err)
        } finally {
            setReportLoading(false)
        }
    }

    return (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            {/* Similar Cases Card */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Similar Case Recommendations</Typography>
                    <TextField
                        label="Key Symptom"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={symptom}
                        onChange={e => setSymptom(e.target.value)}
                    />
                    <Button variant="contained" onClick={analyzeCases} disabled={casesLoading}>
                        {casesLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                        Analyze
                    </Button>
                    {casesError && <Alert severity="error" sx={{ mt: 2 }}>{casesError}</Alert>}
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {cases.map((c, idx) => (
                            <Card key={c.id || idx} variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2">{c.id}</Typography>
                                    <Typography variant="body2">{c.summary}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Medication Suggestions Card */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>AI Medication Suggestions</Typography>
                    <TextField
                        label="Diagnosis"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                    />
                    <Button variant="contained" onClick={fetchMedSuggestions} disabled={medsLoading}>
                        {medsLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                        Generate
                    </Button>
                    {medsError && <Alert severity="error" sx={{ mt: 2 }}>{medsError}</Alert>}
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {medSuggestions.map((m, idx) => (
                            <Card key={`med-${m.drug}-${idx}`} variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2">{m.drug}</Typography>
                                    <Typography variant="body2">{m.note}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Drug Interaction Check Card */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Drug Interaction Check</Typography>
                    <TextField
                        label="Drugs (comma separated)"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={drugInput}
                        onChange={e => setDrugInput(e.target.value)}
                    />
                    <Button variant="contained" onClick={checkInteractions} disabled={interactionsLoading}>
                        {interactionsLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                        Check
                    </Button>
                    {interactionsError && <Alert severity="error" sx={{ mt: 2 }}>{interactionsError}</Alert>}
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {interactions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                {interactionsLoading ? 'Analyzing...' : 'No interactions found'}
                            </Typography>
                        ) : (
                            interactions.map((i, idx) => (
                                <Stack key={`interaction-${i.severity}-${idx}`} direction="row" spacing={1} alignItems="center">
                                    <Chip label={i.severity} color={i.severity === 'High' ? 'error' : i.severity === 'Medium' ? 'warning' : 'default'} />
                                    <Typography variant="body2">{i.message}</Typography>
                                </Stack>
                            ))
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Medicine Identification Card */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Identify Medicine from Image</Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMedicineImageUpload}
                        style={{ marginBottom: 16 }}
                    />
                    {medicineLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
                    {medicineError && <Alert severity="error" sx={{ mt: 2 }}>{medicineError}</Alert>}
                    {medicineResult && (
                        <Card variant="outlined" sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2">Medicine: {medicineResult.medicineName}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>Usage: {medicineResult.usage}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>Precautions: {medicineResult.precautions}</Typography>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Report Interpretation Card */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Interpret Medical Report</Typography>
                    <TextField
                        label="Paste report text"
                        multiline
                        minRows={4}
                        fullWidth
                        sx={{ mb: 2 }}
                        value={reportText}
                        onChange={e => setReportText(e.target.value)}
                    />
                    <Button variant="contained" onClick={interpretReport} disabled={reportLoading}>
                        {reportLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                        Interpret
                    </Button>
                    {reportError && <Alert severity="error" sx={{ mt: 2 }}>{reportError}</Alert>}
                    {reportResult && (
                        <Card variant="outlined" sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Summary</Typography>
                                <Typography variant="body2">{reportResult.summary}</Typography>
                                {reportResult.abnormalItems.length > 0 && (
                                    <>
                                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Abnormal Items</Typography>
                                        <Box component="ul" sx={{ pl: 2 }}>
                                            {reportResult.abnormalItems.map((item, idx) => (
                                                <Typography component="li" key={idx} variant="body2">
                                                    {item}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </>
                                )}
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Recommendations</Typography>
                                <Typography variant="body2">{reportResult.recommendations}</Typography>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}

