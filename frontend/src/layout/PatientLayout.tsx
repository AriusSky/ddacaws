import {Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar,} from '@mui/material';
import {Dashboard, LocalHospital, Event, Description, Assignment, Favorite, SmartToy, Medication} from '@mui/icons-material';
import {useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import Header from '../component/Header';


// Define navigation items for the patient sidebar
const navItems = [
    {label: 'Dashboard', icon: <Dashboard/>, to: '/dashboard'},
    {label: 'Doctors', icon: <LocalHospital/>, to: '/doctors'},
    {label: 'Appointments', icon: <Event/>, to: '/appointments'},
    {label: 'Medical Records', icon: <Description/>, to: '/records'},
    {label: 'Prescriptions', icon: <Assignment/>, to: '/prescriptions'},
    {label: 'Health Data', icon: <Favorite/>, to: '/health'},
    {label: 'Medication Identifier', icon: <Medication/>, to: '/ai/medication'},
    {label: 'AI Consultation', icon: <SmartToy/>, to: '/ai/consultation'},
];

const drawerWidth = 240;

export default function PatientLayout() {
    const {user, logout} = useAuth();
    // State to manage the mobile drawer's visibility
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // The content of the sidebar
    const drawerContent = (
        <List>
            {navItems.map(item => (
                <ListItemButton
                    key={item.to}
                    selected={location.pathname.startsWith(item.to)}
                    onClick={() => {
                        navigate(item.to);
                        setMobileOpen(false); // Close drawer on navigation
                    }}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label}/>
                </ListItemButton>
            ))}
        </List>
    );

    return (
        <Box sx={{display: 'flex'}}>
            <Header
                title="Smart Healthcare"
                userName={user?.fullName}
                onMenuClick={handleDrawerToggle} // The menu button now toggles the mobile drawer
                onProfileClick={() => navigate('/profile')}
                onLogout={logout}
            />

            {/* Sidebar Navigation */}
            <Box
                component="nav"
                sx={{width: {md: drawerWidth}, flexShrink: {md: 0}}}
            >
                {/* Mobile Drawer (Temporary) */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: {xs: 'block', md: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                >
                    <Toolbar/> {/* Spacer for under the AppBar */}
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer (Permanent) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', md: 'block'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                    open
                >
                    <Toolbar/> {/* Spacer for under the AppBar */}
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {md: `calc(100% - ${drawerWidth}px)`},
                }}
            >
                <Toolbar/> {/* Spacer for under the AppBar */}
                <Outlet/>
            </Box>
        </Box>
    );
}
