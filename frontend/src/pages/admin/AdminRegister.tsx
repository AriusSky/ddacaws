import { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, Container, Alert 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { adminService } from '../../services/AdminServices';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // 2. Submit to Backend
    try {
      await adminService.registerAdmin(formData);
      toast.success("New Admin created successfully!");
      navigate('/admin/users'); // Redirect to user list
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to register admin");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: '50%', color: '#1976d2' }}>
            <PersonAddIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">Register New Admin</Typography>
            <Typography variant="body2" color="text.secondary">Create a new system administrator</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Full Name" name="fullName"
            margin="normal" required
            value={formData.fullName} onChange={handleChange}
          />
          <TextField
            fullWidth label="Email Address" name="email" type="email"
            margin="normal" required
            value={formData.email} onChange={handleChange}
          />
          <TextField
            fullWidth label="Password" name="password" type="password"
            margin="normal" required
            value={formData.password} onChange={handleChange}
          />
          <TextField
            fullWidth label="Confirm Password" name="confirmPassword" type="password"
            margin="normal" required
            value={formData.confirmPassword} onChange={handleChange}
          />

          <Button 
            type="submit" 
            fullWidth variant="contained" size="large" 
            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          >
            Create Admin Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}