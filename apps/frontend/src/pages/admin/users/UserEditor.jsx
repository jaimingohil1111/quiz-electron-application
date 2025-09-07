import { useEffect, useState } from 'react';
import {
    Card, CardContent, Typography, Stack, TextField, MenuItem, Button, Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/axios';
import { toast } from '../../../ui/toast';
import BreadcrumbsBar from '../../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../../hooks/usePageTitle';

const ROLES = ['user', 'admin']; // restrict if your backend forbids admin creation

export default function UserEditor() {
    const { id } = useParams();
    const isNew = !id;
    usePageTitle(isNew ? 'Create User' : 'Edit User');

    const nav = useNavigate();
    const [err, setErr] = useState('');
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState({ name: '', email: '', role: 'user', password: '' });

    useEffect(() => {
        (async () => {
            if (!isNew) {
                try {
                    const { data } = await api.get(`/users/${id}`);
                    setUser({ name: data.name || '', email: data.email || '', role: data.role || 'user', password: '' });
                } catch (e) { console.error(e); }
            }
        })();
    }, [id, isNew]);

    const save = async () => {
        setErr('');
        setSaving(true);
        try {
            if (isNew) {
                const payload = { name: user.name, email: user.email, role: user.role, password: user.password };
                await api.post('/users', payload);
                toast('User created', { variant: 'success' });
            } else {
                const payload = { name: user.name, email: user.email, role: user.role };
                await api.put(`/users/${id}`, payload);
                toast('User updated', { variant: 'success' });
            }
            nav('/admin/users');
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || 'Failed to save user';
            setErr(msg);
            toast(msg, { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <BreadcrumbsBar
                items={[
                    { label: 'Home', to: '/' },
                    { label: 'Admin', to: '/admin' },
                    { label: 'Users', to: '/admin/users' },
                    { label: isNew ? 'New' : `Edit #${id}` }
                ]}
            />

            <Card sx={{ maxWidth: 720 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>{isNew ? 'Create User' : 'Edit User'}</Typography>
                    <Stack spacing={2}>
                        <TextField label="Full name" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />
                        <TextField label="Email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
                        <TextField select label="Role" value={user.role} onChange={e => setUser({ ...user, role: e.target.value })} sx={{ maxWidth: 220 }}>
                            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </TextField>

                        {isNew && (
                            <TextField
                                label="Password"
                                type="password"
                                value={user.password}
                                onChange={e => setUser({ ...user, password: e.target.value })}
                                helperText="Initial password (user can change later)."
                            />
                        )}

                        {err && <Alert severity="error">{err}</Alert>}

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button onClick={() => nav('/admin/users')}>Cancel</Button>
                            <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
}
