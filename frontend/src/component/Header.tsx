import {AppBar, Toolbar, IconButton, Typography, Button} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

interface HeaderProps {
    title: string;
    userName?: string | null;
    onMenuClick: () => void;
    onProfileClick?: () => void;
    onLogout: () => void;
}

export default function Header({
                                   title,
                                   userName,
                                   onMenuClick,
                                   onProfileClick,
                                   onLogout,
                               }: HeaderProps) {
    return (
        <AppBar position="fixed" sx={{zIndex: theme => theme.zIndex.drawer + 1}}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{mr: 2, display: {md: 'none'}}} // Only show on mobile
                >
                    <MenuIcon/>
                </IconButton>

                <Typography variant="h6" sx={{flexGrow: 1}}>
                    {title}
                </Typography>

                {userName && (
                    <Button
                        color="inherit"
                        onClick={onProfileClick}
                        sx={{mr: 2, textTransform: 'none', cursor: 'pointer'}}
                    >
                        {userName}
                    </Button>
                )}

                <IconButton
                    color="inherit"
                    onClick={onLogout}
                    title="Logout"
                >
                    <LogoutIcon/>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
