import { useState } from 'react';
import {
    Card, CardContent, CardActions, TextField, Button, Typography, Alert, Stack, MenuItem
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../../features/auth/authSlice';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from '../../ui/toast';

const ROLES = ['user', 'admin']; // If backend restricts admin signup, leave only 'user'

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'user' });
    const { status, error } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const nav = useNavigate();

    const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast('Please fill all fields', { variant: 'warning' }); return;
        }
        if (form.password !== form.confirm) {
            toast('Passwords do not match', { variant: 'warning' }); return;
        }
        // include role explicitly to satisfy backend validator
        const res = await dispatch(signup({
            name: form.name, email: form.email, password: form.password, role: form.role
        }));
        if (res.meta.requestStatus === 'fulfilled') {
            toast('Account created', { variant: 'success' });
            nav('/');
        } else {
            // error is already captured from backend in slice
            toast(error || 'Signup failed', { variant: 'error' });
        }
    };

    return (
        <Stack alignItems="center" mt={4}>
            <Card sx={{ width: 480 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Sign up</Typography>
                    <form onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            <TextField label="Full name" value={form.name} onChange={onChange('name')} fullWidth autoFocus />
                            <TextField label="Email" value={form.email} onChange={onChange('email')} fullWidth />
                            <TextField label="Password" type="password" value={form.password} onChange={onChange('password')} fullWidth />
                            <TextField label="Confirm password" type="password" value={form.confirm} onChange={onChange('confirm')} fullWidth />
                            <TextField
                                select
                                label="Role"
                                value={form.role}
                                onChange={onChange('role')}
                                helperText="Default is user. Choose admin only if allowed."
                            >
                                {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                            </TextField>
                            {error && <Alert severity="error">{error}</Alert>}
                        </Stack>
                    </form>
                </CardContent>
                <CardActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
                    <Button onClick={onSubmit} variant="contained" fullWidth disabled={status === 'loading'}>
                        {status === 'loading' ? 'Creating…' : 'Sign up'}
                    </Button>
                    <Button component={RouterLink} to="/login" fullWidth>
                        Back to Login
                    </Button>
                </CardActions>
            </Card>
        </Stack>
    );
}
