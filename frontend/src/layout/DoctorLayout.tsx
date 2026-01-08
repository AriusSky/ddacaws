import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material"
import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useDoctorAuth } from "../context/DoctorAuthContext"
import { Dashboard, Event, Assignment, People, Analytics, CurrencyExchange } from "@mui/icons-material"
import Header from "../component/Header"


const drawerWidth = 240

const navItems = [
    { label: 'Dashboard', icon: <Dashboard />, to: '/doctor/dashboard' },
    { label: 'Appointments', icon: <Event />, to: '/doctor/appointments' },
    { label: 'Clinical Notes', icon: <Assignment />, to: '/doctor/clinical' },
    { label: 'My Patients', icon: <People />, to: '/doctor/patients' },
    { label: 'AI Tools', icon: <Analytics />, to: '/doctor/ai-tools' },
    { label: 'Income', icon: <CurrencyExchange />, to: '/doctor/income' },
]

export default function DoctorLayout() {
    const { doctor, logout } = useDoctorAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    console.log('DoctorLayout rendered - doctor:', doctor)

    const content = (
        <List>
            {navItems.map(item => (
                <ListItemButton
                    key={item.to}
                    selected={location.pathname === item.to}
                    onClick={() => { navigate(item.to); setMobileOpen(false) }}
                    sx={{
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                        '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            '&:hover': {
                                bgcolor: 'primary.light',
                            }
                        }
                    }}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItemButton>
            ))}
        </List>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            <Header
                title="Doctor Portal"
                userName={doctor?.profile?.fullName ? `Dr. ${doctor.profile.fullName}` : 'Doctor'}
                onMenuClick={() => setMobileOpen(!mobileOpen)}
                onProfileClick={() => navigate("/doctor/profile")}
                onLogout={logout}
            />

            {/* Desktop Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        mt: '64px',
                        height: 'calc(100vh - 64px)',
                    },
                }}
            >
                {content}
            </Drawer>

            {/* Mobile Sidebar */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    [`& .MuiDrawer-paper`]: { width: drawerWidth },
                }}
            >
                <Toolbar />
                {content}
            </Drawer>

            {/* Main Content */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    ml: { xs: 0, md: 0 }
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    )
}
