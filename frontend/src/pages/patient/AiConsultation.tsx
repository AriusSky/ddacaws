import { Paper, TextField, Button, Typography, CircularProgress, Alert, Box, Stack } from "@mui/material"
import { useState } from "react"
import type { SymptomAnalysisResult } from "../../api/ai"
import { analyzeSymptoms } from "../../api/ai"

export default function AiConsultation() {
    const [symptom, setSymptom] = useState('')
    const [result, setResult] = useState<SymptomAnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const analyze = async () => {
        if (!symptom.trim()) {
            setError('Please describe your symptoms')
            return
        }
        
        try {
            setLoading(true)
            setError('')
            const data = await analyzeSymptoms(symptom)
            setResult(data)
        } catch (err) {
            setError('Failed to analyze symptoms. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Symptom Analysis</Typography>
            <TextField 
                label="Describe your symptoms" 
                multiline 
                minRows={4} 
                fullWidth 
                sx={{ mb: 2 }} 
                value={symptom} 
                onChange={e => setSymptom(e.target.value)} 
            />
            
            <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" onClick={analyze} disabled={loading}>
                    {loading && <CircularProgress size={24} sx={{ mr: 1 }} />}
                    Analyze
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {result && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography>Recommended Specialty: <b>{result.recommendedSpecialty}</b></Typography>
                    <Typography sx={{ mt: 1 }}>Urgency Level: <b>{result.urgency}</b></Typography>
                    {result.possibleConditions.length > 0 && (
                        <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Possible Conditions:</Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                                {result.possibleConditions.map((condition, idx) => (
                                    <Typography component="li" key={idx} variant="body2">
                                        {condition}
                                    </Typography>
                                ))}
                            </Box>
                        </>
                    )}
                </Paper>
            )}
        </Paper>
    )
}