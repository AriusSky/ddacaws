import { Box, Button, Container, Paper, TextField, Typography, Stack, Alert } from "@mui/material"
import { useState, useMemo } from "react"
import { useDoctorAuth } from "../../../context/DoctorAuthContext"
import { useNavigate } from "react-router-dom"

export default function DoctorLogin() {
    const { login } = useDoctorAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Field validation
    const validateEmail = (value: string): string => {
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return ""
    }

    const validatePassword = (value: string): string => {
        if (!value) return "Password is required"
        if (value.length < 6) return "Password must be at least 6 characters"
        return ""
    }

    // Real-time validation
    const emailError = email ? validateEmail(email) : ""
    const passwordError = password ? validatePassword(password) : ""

    // Form is valid
    const isFormValid = useMemo(() => {
        return email.trim() && password && !emailError && !passwordError
    }, [email, password, emailError, passwordError])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate form before submission
        const emailErr = validateEmail(email)
        const passwordErr = validatePassword(password)
        
        if (emailErr || passwordErr) {
            setError('Please fix the errors above')
            return
        }

        setError('')
        setLoading(true)
        
        try {
            await login(email, password)
            navigate('/doctor/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            <Container 
                maxWidth="sm" 
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Paper sx={{ p: 4, width: '100%', borderRadius: 8 }} elevation={6}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                        Doctor Login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            <TextField 
                                label="Email *" 
                                type="email"
                                fullWidth 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                                error={!!emailError}
                                helperText={emailError}
                                placeholder="doctor@example.com"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                            />
                            <TextField 
                                label="Password *" 
                                type="password" 
                                fullWidth 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                                error={!!passwordError}
                                helperText={passwordError}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={!isFormValid || loading}
                                sx={{ 
                                    borderRadius: 2,
                                    width: 'fit-content',
                                    alignSelf: 'center',
                                    px: 4,
                                    display: 'block',
                                    marginTop: 4
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </Stack>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        This page is only for the doctors.
                    </Typography>
                </Paper>
            </Container>
        </Box>
        
    )
}