import {useState, useEffect} from 'react';
import {DataGrid, type GridColDef, type GridRenderCellParams} from '@mui/x-data-grid';
import {Box, Typography, Chip, IconButton, Paper, Tooltip, Container, Button} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import {adminService} from '../../services/AdminServices';
import {toast} from 'react-toastify';

export default function DoctorApprovals() {
    // We accept 'any' type temporarily to handle both User (userId) and Doctor (doctorId) objects safely
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadPendingDoctors();
    }, []);

    const loadPendingDoctors = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPendingDoctors();
            console.log("Doctors Data:", data);
            setDoctors(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pending applications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await adminService.toggleUserStatus(id, true);
            toast.success("Doctor approved successfully");
            // Filter out the doctor regardless of whether it uses userId or doctorId
            setDoctors((prev) => prev.filter((doc) => (doc.userId || doc.doctorId) !== id));
        } catch (error) {
            toast.error("Failed to approve doctor");
        }
    };

    const handleReject = async (id: number) => {
        if (window.confirm("Reject and delete this application?")) {
            try {
                await adminService.deleteUser(id);
                toast.info("Application rejected");
                setDoctors((prev) => prev.filter((doc) => (doc.userId || doc.doctorId) !== id));
            } catch (error) {
                toast.error("Failed to reject application");
            }
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'idDisplay',
            headerName: 'ID',
            width: 70,
            valueGetter: (_value, row: any) => row?.userId || row?.doctorId || "N/A"
        },
        {field: 'fullName', headerName: 'Doctor Name', width: 200},
        {field: 'email', headerName: 'Email', width: 250},
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip label={params.value || "Doctor"} color="info" size="small" variant="outlined"/>
            )
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 150,
            renderCell: () => (
                <Chip label="Pending Review" color="warning" size="small"/>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                const id = params.row.userId || params.row.doctorId;
                return (
                    <Box>
                        <Tooltip title="Approve">
                            <IconButton color="success" onClick={() => handleApprove(id)}>
                                <CheckCircleIcon/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Reject">
                            <IconButton color="error" onClick={() => handleReject(id)}>
                                <CancelIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        },
    ];

    if (!loading && doctors.length === 0) {
        return (
            <Container maxWidth="lg">
                {/* Fixed Header Layout */}
                <Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Doctor Approvals</Typography>
                        <Typography variant="body1" color="text.secondary">Review accounts.</Typography>
                    </Box>
                    <Button startIcon={<RefreshIcon/>} onClick={loadPendingDoctors}>Refresh</Button>
                </Box>

                <Paper
                    sx={{
                        p: 8, textAlign: 'center', bgcolor: '#f8f9fa',
                        border: '1px dashed #e0e0e0', borderRadius: 4,
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                >
                    <Box sx={{p: 3, bgcolor: '#e3f2fd', borderRadius: '50%', mb: 2}}>
                        <FactCheckIcon sx={{fontSize: 60, color: '#1976d2'}}/>
                    </Box>
                    <Typography variant="h5" fontWeight="bold">No Pending Applications</Typography>
                    <Typography color="text.secondary">You are all caught up!</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{mb: 1}} fontWeight="bold">Doctor Approvals</Typography>

            <Paper sx={{height: 500, width: '100%', borderRadius: 2}} elevation={2}>
                <DataGrid
                    rows={doctors}
                    columns={columns}
                    getRowId={(row) => row.doctorId || row.userId || Math.random()}
                    initialState={{pagination: {paginationModel: {pageSize: 5}}}}
                    pageSizeOptions={[5, 10]}
                    loading={loading}
                    disableRowSelectionOnClick
                />
            </Paper>
        </Container>
    );
}
