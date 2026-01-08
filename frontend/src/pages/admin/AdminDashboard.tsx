import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Grid, Paper, Typography, Box, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Chip,  Skeleton, Container, Card, CardContent, IconButton
} from '@mui/material';
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid} from 'recharts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {adminService} from '../../services/AdminServices';
import type {AnalyticsData, AdminAppointment, SystemStats } from '../../types';

export default function AdminDashboard() {
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);

    // 👇 NEW: State for the Chart
    const [chartData, setChartData] = useState<AnalyticsData[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                // 1. Load Stats
                const statsData = await adminService.getSystemStats();
                setStats(statsData);

                // 2. Load Today's Schedule
                const scheduleData = await adminService.getTodaysAppointments();
                setAppointments(scheduleData);

                // 3. Load Pending Doctors count
                const pendingDocs = await adminService.getPendingDoctors();
                setPendingCount(pendingDocs.length);

                // 4. 👇 Load Real Chart Data
                const analyticsData = await adminService.getAppointmentAnalytics();
                setChartData(analyticsData);

            } catch (error) {
                console.error("Dashboard Load Error", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    // --- REUSABLE COMPONENTS ---

    // 1. The "Stat Card" (Clean, Icon on right, subtle background)
    const StatCard = ({title, value, icon, color, onClick}: any) => (
        <Card
            elevation={0} // Flat design is cleaner
            sx={{
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': onClick ? {transform: 'translateY(-4px)', borderColor: color} : {}
            }}
            onClick={onClick}
        >
            <CardContent sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3}}>
                <Box>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary"
                                sx={{textTransform: 'uppercase', letterSpacing: 1}}>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton variant="text" width={60} height={40}/>
                    ) : (
                        <Typography variant="h4" fontWeight="800" sx={{mt: 1, color: '#2c3e50'}}>
                            {value}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        bgcolor: `${color}15`, // 15% opacity of the color
                        color: color,
                        p: 1.5,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{py: 2}}>
            {/* Header Section */}
            <Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{color: '#1a1a1a'}}>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{mt: 0.5}}>
                        Welcome back, Admin. Here is what's happening today.
                    </Typography>
                </Box>
                {/* Date Display */}
                <Chip
                    label={new Date().toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long'})}
                    sx={{bgcolor: 'white', border: '1px solid #e0e0e0', fontWeight: 'bold'}}
                />
            </Box>

            {/* --- STATS GRID --- */}
            <Grid container spacing={3} sx={{mb: 4}}>
                {/* Total Users */}
                <Grid size={{xs: 1, sm: 2, md: 3}}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<PeopleAltIcon sx={{fontSize: 30}}/>}
                        color="#3f51b5"
                    />
                </Grid>

                {/* Total Appointments */}
                <Grid size={{xs: 1, sm: 2, md: 3}}>
                    <StatCard
                        title="Appointments"
                        value={stats?.totalAppointments || 0}
                        icon={<CalendarTodayIcon sx={{fontSize: 30}}/>}
                        color="#009688"
                    />
                </Grid>

                {/* Pending Actions (Clickable) */}
                <Grid size={{xs: 1, sm: 2, md: 3}}>
                    <StatCard
                        title="Pending Doctors"
                        value={pendingCount}
                        icon={<PendingActionsIcon sx={{fontSize: 30}}/>}
                        color={pendingCount > 0 ? "#d32f2f" : "#bdbdbd"}
                        onClick={() => navigate('/admin/doctors')}
                    />
                </Grid>
            </Grid>

            {/* --- MAIN CONTENT SPLIT --- */}
            <Grid container spacing={3}>

                {/* LEFT: Analytics Chart */}
                <Grid size={{xs: 1, lg: 2}}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            height: 450,
                            border: '1px solid #e0e0e0',
                            borderRadius: 3
                        }}
                    >
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3}}>
                            <Typography variant="h6" fontWeight="bold">Appointment Analytics</Typography>
                            <IconButton size="small"><MoreVertIcon/></IconButton>
                        </Box>

                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: '#9e9e9e', fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: '#9e9e9e', fontSize: 12}}
                                />
                                <Tooltip
                                    cursor={{fill: '#f5f5f5'}}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: 'none',
                                        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="appointments"
                                    fill="#3f51b5"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* RIGHT: Today's Schedule List */}
                <Grid size={{xs: 1, lg: 2}}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: 450,
                            border: '1px solid #e0e0e0',
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{p: 3, borderBottom: '1px solid #f0f0f0'}}>
                            <Typography variant="h6" fontWeight="bold">Today's Schedule</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {appointments.length} appointments scheduled
                            </Typography>
                        </Box>

                        <List sx={{overflow: 'auto', flexGrow: 1, px: 2}}>
                            {loading ? (
                                <Box sx={{p: 2}}><Skeleton height={50}/><Skeleton height={50}/></Box>
                            ) : appointments.length === 0 ? (
                                <Box sx={{p: 4, textAlign: 'center', opacity: 0.5}}>
                                    <CalendarTodayIcon sx={{fontSize: 40, mb: 1}}/>
                                    <Typography variant="body2">No appointments today</Typography>
                                </Box>
                            ) : (
                                appointments.map((appt) => (
                                    <ListItem
                                        key={appt.appointmentId}
                                        sx={{
                                            mb: 1,
                                            bgcolor: '#fafafa',
                                            borderRadius: 2,
                                            border: '1px solid transparent',
                                            '&:hover': {borderColor: '#eeeeee', bgcolor: 'white'}
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold'}}>
                                                {appt.doctorName[0]}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="subtitle2"
                                                                 fontWeight="bold">{appt.doctorName}</Typography>}
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(appt.appointmentDate).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Typography>
                                            }
                                        />
                                        <Chip
                                            label={appt.status}
                                            size="small"
                                            color={appt.status === 'Completed' ? 'success' : 'default'}
                                            sx={{height: 24, fontSize: '0.7rem'}}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>

                        <Box sx={{p: 2, borderTop: '1px solid #f0f0f0', textAlign: 'center'}}>
                            <Typography variant="caption" color="primary" sx={{cursor: 'pointer', fontWeight: 'bold'}}>
                                View All Activity
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );
}
