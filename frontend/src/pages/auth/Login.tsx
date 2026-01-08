import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import BackgroundCarousel from '../../component/BackgroundCarousel'

export default function Login() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const location = useLocation() as any

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            console.log('[LOGIN PAGE] Starting login with:', { email })
            await login(email, password)
            console.log('[LOGIN PAGE] Login succeeded, redirecting')
            const to = location.state?.from?.pathname ?? '/dashboard'
            window.history.replaceState(null, '', to)
        } catch (e: any) {
            console.error('[LOGIN PAGE] Login error:', e)
            const errorMessage = e?.response?.data?.message || e?.message || 'Login failed. Please check your email and password.'
            toast.error(errorMessage)
        }
    }

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            <BackgroundCarousel />
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
                <Paper sx={{ p: 4, borderRadius: 8, textAlign: 'center' }} elevation={6}>
                    <Typography variant="h5" sx={{ mb: 5 }}>Patient Login</Typography>
                    <Box component="form" onSubmit={onSubmit}>
                        <TextField label="Email" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }} value={email} onChange={e => setEmail(e.target.value)} />
                        <TextField label="Password" type="password" fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 4 } }} value={password} onChange={e => setPassword(e.target.value)} />
                        <Button type="submit" variant="contained" sx={{ mt: 2, borderRadius: 2 }}>Login</Button>
                        <Typography variant='body2' align='center' sx={{ mt: 2 }}>
                            Don't have an account yet?{' '}
                            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}