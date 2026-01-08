import { useEffect, useState } from 'react';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, MenuItem 
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import { adminService } from '../../services/AdminServices';
import { toast } from 'react-toastify';
import type {AdminAppointment} from "../../types.ts";

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  
  // Modal State
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({ id: 0, date: '', status: '' });

  // 1. Fetch Data
  const loadAppointments = async () => {
    try {
      const data = await adminService.getAllAppointments();
      setAppointments(data.appointments);
    } catch (error) {
      toast.error("Failed to load appointments");
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  // 2. Handle "Edit" Click
  const handleEditClick = (appt: any) => {
    setEditData({
      id: appt.appointmentId,
      // Format appointmentDate for the input field (YYYY-MM-DDTHH:MM)
      date: new Date(appt.appointmentDate).toISOString().slice(0, 16),
      status: appt.status
    });
    setOpen(true);
  };

  // 3. Handle "Save" Click
  const handleSave = async () => {
    try {
      await adminService.updateAppointment(editData.id, {
        appointmentDate: editData.date,
        status: editData.status
      });
      toast.success("Schedule updated!");
      setOpen(false);
      loadAppointments(); // Refresh the table
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalendarMonthIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">Appointment Schedules</Typography>
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.appointmentId} hover>
                <TableCell>#{appt.appointmentId}</TableCell>
                <TableCell>{appt.patientName}</TableCell>
                <TableCell>{appt.doctorName}</TableCell>
                <TableCell>{new Date(appt.appointmentDate).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={appt.status} color={getStatusColor(appt.status) as any} size="small" variant="outlined"/>
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditClick(appt)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- EDIT MODAL --- */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Schedule</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          
          {/* Date Picker */}
          <TextField
            label="Appointment Date"
            type="datetime-local"
            fullWidth margin="normal"
            value={editData.date}
            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          {/* Status Dropdown */}
          <TextField
            select label="Status"
            fullWidth margin="normal"
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
