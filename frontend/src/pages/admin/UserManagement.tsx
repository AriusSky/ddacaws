import { useState, useEffect } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Box, Typography, Chip, IconButton, Paper, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { adminService } from '../../services/AdminServices';
import type { User } from '../../types';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams(); 
  const searchTerm = searchParams.get('q') || ''

  // --- EDIT MODAL STATE ---
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    fullName: '',
    email: '',
    password: '' // Optional: Leave blank to keep current password
  });

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to load users", error);
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Status (Active/Disabled)
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'disabled'} successfully`);
      loadUsers(); 
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Delete User
  const handleDelete = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter((u) => u.userId !== userId));
        toast.success("User deleted");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  // --- EDIT FUNCTIONS ---

  // 1. Open the Modal and fill it with the user's current data
  const handleOpenEdit = (user: any) => {
    setEditData({
      id: user.userId,
      fullName: user.fullName,
      email: user.email,
      password: '' // Always start empty for security
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // 2. Submit the changes to the Backend
  const handleSubmitEdit = async () => {
    try {
      await adminService.updateUser(editData.id, {
        fullName: editData.fullName,
        email: editData.email,
        ...(editData.password && { password: editData.password }) // Only send password if user typed one
      });
      toast.success("User updated successfully");
      loadUsers(); // Refresh table to show new name/email
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    }
  };

  // Define Table Columns
  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'Full Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const color = params.value === 'Doctor' ? 'info' : params.value === 'Admin' ? 'warning' : 'default';
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? "Active" : "Disabled"}
          color={params.value ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {/* Toggle Status */}
          <Tooltip title={params.row.isActive ? "Disable User" : "Activate User"}>
            <IconButton 
              color={params.row.isActive ? 'warning' : 'success'} 
              onClick={() => handleToggleStatus(params.row.userId, params.row.isActive)}
            >
              {params.row.isActive ? <BlockIcon /> : <CheckCircleIcon />}
            </IconButton>
          </Tooltip>

          {/* Edit Button (Now Working!) */}
          <Tooltip title="Edit Profile">
            <IconButton color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip title="Delete User">
            <IconButton color="error" onClick={() => handleDelete(params.row.userId)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Filter users based on Name OR Email
  const filteredUsers = users.filter((user) => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">User Management</Typography>
        <Button startIcon={<RefreshIcon />} onClick={loadUsers}>Refresh List</Button>
      </Box>

      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row.userId} // Critical for avoiding ID errors
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* --- EDIT USER DIALOG (POPUP) --- */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Profile</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal" fullWidth label="Full Name"
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
            />
            <TextField
              margin="normal" fullWidth label="Email Address"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
            <TextField
              margin="normal" fullWidth label="New Password (Leave blank to keep current)"
              type="password"
              value={editData.password}
              helperText="Only enter data here if you want to change the password."
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
