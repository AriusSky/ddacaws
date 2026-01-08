import { useEffect, useState } from 'react';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Avatar, Stack
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminService } from '../../services/AdminServices';
import type { User } from '../../types';
import { toast } from 'react-toastify';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<User[]>([]);

  // Load Data
  const loadDoctors = async () => {
    try {
      const data = await adminService.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => { loadDoctors(); }, []);

  // Handle Approve/Disable
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      // Call the unified updateUser endpoint
      await adminService.updateUser(id, { isActive: !currentStatus });
      toast.success(`Doctor ${currentStatus ? 'disabled' : 'activated'}`);
      loadDoctors(); // Refresh list
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("Doctor deleted");
      loadDoctors();
    } catch (error) {
      toast.error("Failed to delete doctor");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MedicalServicesIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">Doctor Management</Typography>
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Profile</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doc) => (
              <TableRow key={doc.userId} hover>
                <TableCell>
                  <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}>
                    {doc.fullName[0]}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">{doc.fullName}</Typography>
                </TableCell>
                <TableCell>{doc.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={doc.isActive ? "Active" : "Pending / Disabled"} 
                    color={doc.isActive ? "success" : "warning"} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {/* Toggle Status Button */}
                    <IconButton 
                      color={doc.isActive ? "warning" : "success"}
                      onClick={() => handleToggleStatus(doc.userId, doc.isActive)}
                      title={doc.isActive ? "Disable Account" : "Approve / Activate"}
                    >
                      {doc.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                    </IconButton>

                    {/* Delete Button */}
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(doc.userId)}
                      title="Delete Doctor"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {doctors.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No doctors found in the system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
