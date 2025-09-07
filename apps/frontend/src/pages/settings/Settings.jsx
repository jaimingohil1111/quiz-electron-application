import { useEffect, useState } from 'react';
import {
    Card, CardContent, Typography, Stack, FormControlLabel, Switch, RadioGroup, Radio,
    TextField, Button, Divider, Grid, Alert
} from '@mui/material';
import BreadcrumbsBar from '../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../hooks/usePageTitle';
import { toast } from '../../ui/toast';
import api from '../../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutThunk, fetchMe } from '../../features/auth/authSlice';

const THEME_KEY = 'themeMode';
const DENSITY_KEY = 'gridDensity';
const APP_TITLE_KEY = 'appTitleOverride';

export default function SettingsPage() {
    usePageTitle('Settings');

    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();

    // Common: theme toggle
    const [themeMode, setThemeMode] = useState(localStorage.getItem(THEME_KEY) || 'light');

    // Profile (start with Redux values; then we will load /users/me for freshest copy)
    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileErr, setProfileErr] = useState('');

    // Admin-only
    const isAdmin = user?.role === 'admin';
    const [gridDensity, setGridDensity] = useState(localStorage.getItem(DENSITY_KEY) || 'compact');
    const [appTitle, setAppTitle] = useState(localStorage.getItem(APP_TITLE_KEY) || '');

    // 🔄 Keep local form in sync if Redux user changes (e.g., after fetchMe)
    useEffect(() => {
        setProfile({ name: user?.name || '', email: user?.email || '' });
    }, [user?.name, user?.email]);

    // 🔁 Load fresh profile on mount
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/users/me');
                setProfile({ name: data.name || '', email: data.email || '' });
                // also make sure Redux is in sync (optional but nice)
                dispatch(fetchMe());
            } catch { /* interceptor toasts on error */ }
        })();
    }, [dispatch]);

    const saveTheme = () => {
        localStorage.setItem(THEME_KEY, themeMode);
        window.dispatchEvent(new CustomEvent('prefs:updated', { detail: { themeMode } }));
        toast('Theme updated', { variant: 'success' });
    };

    const saveProfile = async () => {
        setProfileErr('');
        setSavingProfile(true);
        try {
            // Server updates my name; assume it returns the updated user
            const { data } = await api.put('/users/me', { name: profile.name });
            // Update local form with server truth
            setProfile(p => ({ ...p, name: data?.name ?? p.name }));
            // Refresh Redux auth.user so header/avatar update immediately
            await dispatch(fetchMe());
            toast('Profile updated', { variant: 'success' });
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || 'Failed to update profile';
            setProfileErr(msg);
            toast(msg, { variant: 'error' });
        } finally {
            setSavingProfile(false);
        }
    };

    const logout = async () => {
        await dispatch(logoutThunk());
        toast('Logged out', { variant: 'info' });
        window.location.href = '/login';
    };

    const saveAdmin = () => {
        localStorage.setItem(DENSITY_KEY, gridDensity);
        localStorage.setItem(APP_TITLE_KEY, appTitle);
        window.dispatchEvent(new CustomEvent('prefs:updated', {
            detail: { gridDensity, appTitleOverride: appTitle }
        }));
        toast('Admin settings saved', { variant: 'success' });
    };

    const resetTitle = () => {
        setAppTitle('');
        window.dispatchEvent(new CustomEvent('prefs:updated', { detail: { appTitleOverride: '' } }));
        toast('Title reset to default', { variant: 'info' });
    };

    return (
        <>
            <BreadcrumbsBar items={[{ label: 'Home', to: '/' }, { label: 'Settings' }]} />

            <Grid container spacing={2}>
                {/* Common settings */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Appearance</Typography>
                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={themeMode === 'dark'}
                                            onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                                        />
                                    }
                                    label={themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
                                />
                                <Button variant="contained" onClick={saveTheme}>Save Theme</Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Profile</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Full name"
                                    value={profile.name}
                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                />
                                <TextField label="Email" value={profile.email} disabled />
                                {profileErr && <Alert severity="error">{profileErr}</Alert>}
                                <Stack direction="row" spacing={1}>
                                    <Button variant="contained" onClick={saveProfile} disabled={savingProfile}>
                                        {savingProfile ? 'Saving…' : 'Save Profile'}
                                    </Button>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    Email is shown for reference. Implement email/password change flows here if your backend supports it.
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Logout</Typography>
                            <Button color="error" variant="outlined" onClick={logout}>Logout</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Admin-only settings */}
                {isAdmin && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Admin Preferences</Typography>
                                <Stack spacing={2}>
                                    <section>
                                        <Typography variant="subtitle1">DataGrid Density</Typography>
                                        <RadioGroup row value={gridDensity} onChange={(e) => setGridDensity(e.target.value)}>
                                            <FormControlLabel value="compact" control={<Radio />} label="Compact" />
                                            <FormControlLabel value="standard" control={<Radio />} label="Standard" />
                                            <FormControlLabel value="comfortable" control={<Radio />} label="Comfortable" />
                                        </RadioGroup>
                                    </section>

                                    <Divider />

                                    <section>
                                        <Typography variant="subtitle1">App Title</Typography>
                                        <TextField
                                            fullWidth
                                            label="App Title (optional override)"
                                            placeholder="e.g. Quiz Studio"
                                            value={appTitle}
                                            onChange={(e) => setAppTitle(e.target.value)}
                                        />
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Button onClick={resetTitle}>Reset to default</Button>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            Shown in the top AppBar. Leave blank to use VITE_APP_NAME.
                                        </Typography>
                                    </section>

                                    <Stack direction="row" justifyContent="flex-end">
                                        <Button variant="contained" onClick={saveAdmin}>Save Admin Settings</Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </>
    );
}
