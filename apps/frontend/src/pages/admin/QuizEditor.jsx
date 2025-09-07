import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, TextField, TextareaAutosize, Button, Typography, MenuItem, Card, CardContent } from '@mui/material';
import { toast } from '../../ui/toast';

export default function QuizEditor() {
    const { id } = useParams();
    const nav = useNavigate();
    const isNew = !id;
    const [form, setForm] = useState({
        title: '', slug: '', description: '', category: '', difficulty: '',
        tags: [], status: 'draft', time_limit_sec: 300
    });

    useEffect(() => {
        (async () => {
            if (id) {
                const { data } = await api.get(`/quizzes/${id}`);
                setForm({
                    title: data.title, slug: data.slug, description: data.description || '',
                    category: data.category || '', difficulty: data.difficulty || '',
                    tags: data.tags ? JSON.parse(data.tags || '[]') : [],
                    status: data.status, time_limit_sec: data.time_limit_sec || 300
                });
            }
        })();
    }, [id]);

    const save = async () => {
        const payload = { ...form, tags: form.tags.filter(Boolean) };
        if (!payload.title || !payload.slug) {
            toast('Title and slug are required', { variant: 'warning' }); return;
        }
        try {
            if (isNew) { await api.post('/quizzes', payload); toast('Quiz created', { variant: 'success' }); }
            else { await api.put(`/quizzes/${id}`, payload); toast('Quiz updated', { variant: 'success' }); }
            nav('/admin/quizzes');
        } catch (e) { console.error(e); }
    };

    return (
        <Card sx={{ maxWidth: 720 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>{isNew ? 'New' : 'Edit'} Quiz</Typography>
                <Stack spacing={2}>
                    <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <TextField label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                    <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    <Stack direction="row" spacing={2}>
                        <TextField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                        <TextField label="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} />
                    </Stack>
                    <TextField label="Tags (comma)" value={form.tags.join(',')}
                        onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()) })} />
                    <Stack direction="row" spacing={2}>
                        <TextField select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} sx={{ minWidth: 160 }}>
                            <MenuItem value="draft">draft</MenuItem>
                            <MenuItem value="published">published</MenuItem>
                        </TextField>
                        <TextField type="number" label="Time limit (sec)" value={form.time_limit_sec}
                            onChange={e => setForm({ ...form, time_limit_sec: Number(e.target.value || 0) })} />
                    </Stack>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={() => nav('/admin/quizzes')}>Cancel</Button>
                        <Button onClick={save} variant="contained">Save</Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
