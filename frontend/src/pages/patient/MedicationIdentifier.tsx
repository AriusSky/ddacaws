import { Button, Paper, Typography, Box, CircularProgress, Card, CardContent, Alert } from "@mui/material";
import { useRef, useState } from 'react'
import { identifyMedicine, type MedicineIdentificationResult } from "../../api/ai";
import { toast } from "react-toastify";

export default function MedicationIdentifier() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [result, setResult] = useState<MedicineIdentificationResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [_, setImageBase64] = useState<string | null>(null)

    const onPick = () => inputRef.current?.click()
    
    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return
        
        const url = URL.createObjectURL(selectedFile)
        setPreview(url)
        setResult(null)
        setError(null)
        
        // Convert file to base64
        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64String = event.target?.result as string
            const base64 = base64String.split(',')[1] // Remove data:image/jpeg;base64, prefix
            setImageBase64(base64)
            
            // Automatically identify medicine after converting to base64
            setLoading(true)
            setError(null)
            try {
                const identifiedResult = await identifyMedicine(base64)
                setResult(identifiedResult)
                toast.success('Medication identified successfully')
            } catch (err: any) {
                const errorMsg = err.message || 'Failed to identify medication'
                setError(errorMsg)
                toast.error(errorMsg)
                console.error('Error identifying medication:', err)
            } finally {
                setLoading(false)
            }
        }
        reader.readAsDataURL(selectedFile)
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Medication Identification</Typography>
            <input ref={inputRef} onChange={onFile} type="file" accept="image/*" hidden />
            <Button variant="contained" onClick={onPick}>Upload Photo</Button>
            {preview && (
                <Box sx={{ marginTop: 2 }}>
                    <img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8}} />
                    {loading && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography>Analyzing image...</Typography>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {result && (
                        <Card variant="outlined" sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Medicine: {result.medicineName}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Usage:</strong> {result.usage}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Precautions:</strong> {result.precautions}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            )}
        </Paper>
    )
}
