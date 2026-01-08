import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LinkIcon from '@mui/icons-material/Link';
import SecurityIcon from '@mui/icons-material/Security';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Header from '../component/Header';
import { useAdminAuth } from "../context/AdminAuthContext.tsx";

const drawerWidth = 240;

export default function AdminLayout() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Doctor Management', icon: <ManageAccountsIcon />, path: '/admin/doctors' },
        { text: 'Blockchain Verify', icon: <LinkIcon />, path: '/admin/blockchain' },
        { text: 'Add Admin', icon: <SecurityIcon />, path: '/admin/register-admin' },
        { text: 'Schedules', icon: <CalendarMonthIcon />, path: '/admin/appointments' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <Header
                title="Admin Portal"
                userName={admin?.fullName || 'Admin'}
                onMenuClick={() => false}
                onLogout={logout}
            />
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton onClick={() => navigate(item.path)}>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
