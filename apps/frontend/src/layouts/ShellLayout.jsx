import { useState, useMemo } from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
    AppBar, Toolbar, IconButton, Typography, Drawer, Divider, List,
    ListItemButton, ListItemIcon, ListItemText, Avatar, Stack, Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import QuizIcon from '@mui/icons-material/Quiz';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 240;
const DRAWER_KEY = 'drawerOpen';

export default function ShellLayout({ appTitle }) {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();

    const [open, setOpen] = useState(() => {
        const saved = localStorage.getItem(DRAWER_KEY);
        return saved === null ? true : saved === 'true';
    });

    const initials = useMemo(() =>
        (user?.name || user?.email || 'U').trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join(''),
        [user]);

    const items = [
        { to: '/', icon: <DashboardIcon />, text: 'Dashboard' },
        { to: '/quizzes', icon: <QuizIcon />, text: 'Quizzes' },
        ...(user?.role === 'admin' ? [{ to: '/admin', icon: <AdminPanelSettingsIcon />, text: 'Admin' }] : []),
        { to: '/settings', icon: <SettingsIcon />, text: 'Settings' }
    ];

    const handleItem = async (to) => {
        if (to === '/__logout') {
            await dispatch(logout());
            window.location.href = '/login';
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={() => { setOpen(o => { localStorage.setItem(DRAWER_KEY, String(!o)); return !o; }); }} sx={{ mr: 2 }} aria-label="toggle navigation">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>{appTitle}</Typography>

                    {/* Header right: Avatar + user name */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>{initials}</Avatar>
                        <Typography variant="body2">{user?.name || user?.email}</Typography>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                open={open}
                sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
            >
                <Toolbar />
                <Divider />
                <List>
                    {items.map(it => (
                        <ListItemButton
                            key={it.text}
                            component={it.to === '/__logout' ? 'button' : RouterLink}
                            to={it.to === '/__logout' ? undefined : it.to}
                            onClick={() => handleItem(it.to)}
                        >
                            <ListItemIcon>{it.icon}</ListItemIcon>
                            <ListItemText primary={it.text} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{
                p: 3,
                ml: open ? `${drawerWidth}px` : 0,
                transition: (t) => t.transitions.create(['margin-left'], { duration: t.transitions.duration.shorter })
            }}>
                <Toolbar />
                <Outlet />
            </Box>
        </>
    );
}
