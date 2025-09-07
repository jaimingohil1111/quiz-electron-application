import { useState } from 'react';
import { Card, CardContent, CardActions, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from '../../ui/toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { status, error } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const nav = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(login({ email, password }));
        if (res.meta.requestStatus === 'fulfilled') {
            toast('Logged in', { variant: 'success' });
            nav('/');
        } else {
            toast(error || 'Login failed', { variant: 'error' });
        }
    };

    return (
        <Stack alignItems="center" mt={4}>
            <Card sx={{ width: 420 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Login</Typography>
                    <form onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth autoFocus />
                            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
                            {error && <Alert severity="error">{error}</Alert>}
                        </Stack>
                    </form>
                </CardContent>
                <CardActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
                    <Button onClick={onSubmit} variant="contained" fullWidth disabled={status === 'loading'}>
                        {status === 'loading' ? 'Logging in…' : 'Login'}
                    </Button>
                    <Button component={RouterLink} to="/signup" fullWidth>
                        Sign up
                    </Button>
                </CardActions>
            </Card>
        </Stack>
    );
}
