import { useEffect, useState } from 'react';
import {
    Card, CardContent, Typography, Stack, FormControlLabel, Switch, RadioGroup, Radio,
    TextField, Button, Divider
} from '@mui/material';
import BreadcrumbsBar from '../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../hooks/usePageTitle';
import { toast } from '../../ui/toast';

const THEME_KEY = 'themeMode';
const DENSITY_KEY = 'gridDensity';
const APP_TITLE_KEY = 'appTitleOverride';

export default function AdminSettings() {
    usePageTitle('Settings');

    const [themeMode, setThemeMode] = useState(localStorage.getItem(THEME_KEY) || 'light');
    const [gridDensity, setGridDensity] = useState(localStorage.getItem(DENSITY_KEY) || 'compact');
    const [appTitle, setAppTitle] = useState(localStorage.getItem(APP_TITLE_KEY) || '');

    useEffect(() => { /* load done via useState init */ }, []);

    const save = () => {
        localStorage.setItem(THEME_KEY, themeMode);
        localStorage.setItem(DENSITY_KEY, gridDensity);
        localStorage.setItem(APP_TITLE_KEY, appTitle);

        // Let App.jsx know to refresh UI instantly
        window.dispatchEvent(new CustomEvent('prefs:updated', {
            detail: {
                themeMode,
                gridDensity,
                appTitleOverride: appTitle
            }
        }));
        toast('Settings saved', { variant: 'success' });
    };

    const resetTitle = () => {
        setAppTitle('');
        window.dispatchEvent(new CustomEvent('prefs:updated', {
            detail: { appTitleOverride: '' }
        }));
        toast('Title reset to default', { variant: 'info' });
    };

    return (
        <>
            <BreadcrumbsBar items={[{ label: 'Home', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Settings' }]} />

            <Card sx={{ maxWidth: 720 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Application Settings</Typography>

                    <Stack spacing={3}>
                        <section>
                            <Typography variant="subtitle1" gutterBottom>Theme</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={themeMode === 'dark'}
                                        onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                                    />
                                }
                                label={themeMode === 'dark' ? 'Dark' : 'Light'}
                            />
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="subtitle1" gutterBottom>DataGrid Density</Typography>
                            <RadioGroup
                                row
                                value={gridDensity}
                                onChange={(e) => setGridDensity(e.target.value)}
                                name="density"
                            >
                                <FormControlLabel value="compact" control={<Radio />} label="Compact" />
                                <FormControlLabel value="standard" control={<Radio />} label="Standard" />
                                <FormControlLabel value="comfortable" control={<Radio />} label="Comfortable" />
                            </RadioGroup>
                            <Typography variant="caption" color="text.secondary">
                                Controls row height and padding in tables across the app.
                            </Typography>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="subtitle1" gutterBottom>Branding</Typography>
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
                                The title shown in the top AppBar. Leave blank to use the default from .env (VITE_APP_NAME).
                            </Typography>
                        </section>

                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button onClick={save} variant="contained">Save Changes</Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
}
