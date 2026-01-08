import {useState} from 'react';
import {
    Box, Paper, Typography, TextField, Button, Alert, Grid, CircularProgress, CssBaseline
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {useAuth} from '../../../context/AuthContext.tsx';
import {toast} from 'react-toastify';

export default function Login() {
    const {login} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Admin access granted.");
        } catch (err: any) {
            console.error(err);
            setError('Access Denied. Check credentials or permissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid
            container
            component="main"
            sx={{
                height: '100vh',
                // ✅ 1. MOVE IMAGE HERE (Background covers whole screen)
                backgroundImage: 'url("/admin-2.jpg")',
                backgroundRepeat: 'no-repeat',
                backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // ✅ 2. CENTER THE CARD
                display: 'flex',
                alignItems: 'center',     // Vertical Center
                justifyContent: 'center', // Horizontal Center
            }}
        >
            <CssBaseline/>

            {/* ✅ 3. THE FLOATING CARD (No more split screen) */}
            <Grid
                size={{
                    xs: 11, // Mobile: Take up almost full width
                    sm: 8,  // Tablet: Take up 60%
                    md: 4  // Desktop: Take up 30% (Nice and compact)
                }}
                component={Paper}
                elevation={10} // Stronger shadow to make it "pop" off the image
                square={false} // Rounded corners look better for floating cards
                sx={{
                    borderRadius: 4, // Rounded edges
                    opacity: 0.95,   // Slight transparency (optional, looks cool)
                    p: 4             // Padding inside the card
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{p: 2, bgcolor: 'error.main', borderRadius: '50%', mb: 2}}>
                        <AdminPanelSettingsIcon sx={{color: 'white', fontSize: 30}}/>
                    </Box>

                    <Typography component="h1" variant="h5" fontWeight="bold">
                        Administrator Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        Authorized Personnel Only
                    </Typography>

                    {error && <Alert severity="error" sx={{width: '100%', mt: 2}}>{error}</Alert>}

                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 1, width: '100%'}}>
                        <TextField
                            margin="normal" required fullWidth
                            id="email" label="Admin Email" name="email"
                            autoComplete="email" autoFocus
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth
                            name="password" label="Password" type="password"
                            id="password" autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type="submit" fullWidth variant="contained" color="error"
                            sx={{mt: 3, mb: 2, py: 1.5, fontWeight: 'bold'}}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : 'Enter Dashboard'}
                        </Button>

                        <Typography variant="caption" display="block" align="center"
                                    sx={{mt: 5, color: 'text.disabled'}}>
                            System v1.0 • Restricted Area
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}
