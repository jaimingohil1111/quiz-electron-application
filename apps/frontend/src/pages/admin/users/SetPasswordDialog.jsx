import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Alert
} from '@mui/material';
import api from '../../../api/axios';
import { toast } from '../../../ui/toast';

export default function SetPasswordDialog({ user, open, onClose, onSaved }) {
    const [pwd, setPwd] = useState('');
    const [confirm, setConfirm] = useState('');
    const [err, setErr] = useState('');
    const [saving, setSaving] = useState(false);

    const reset = () => { setPwd(''); setConfirm(''); setErr(''); };

    const submit = async () => {
        setErr('');
        if (!pwd) { setErr('Password is required'); return; }
        if (pwd !== confirm) { setErr('Passwords do not match'); return; }
        setSaving(true);
        try {
            // Send both keys to cover schema naming differences (server will ignore the extra one)
            const payload = { userId: user.id, password: pwd, newPassword: pwd };
            await api.post('/users/set-password', payload);
            toast('Password updated', { variant: 'success' });
            onSaved?.();
            reset();
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || 'Failed to set password';
            setErr(msg);
            toast(msg, { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const close = () => { reset(); onClose?.(); };

    return (
        <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
            <DialogTitle>Set password {user ? `for ${user.email}` : ''}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <TextField label="New password" type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
                    <TextField label="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
                    {err && <Alert severity="error">{err}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>Cancel</Button>
                <Button variant="contained" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </DialogActions>
        </Dialog>
    );
}
