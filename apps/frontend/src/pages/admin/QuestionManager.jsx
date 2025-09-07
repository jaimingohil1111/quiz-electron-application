import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from '../../ui/toast';

const TYPES = ['mcq', 'tf', 'fib'];

export default function QuestionManager() {
    const { id } = useParams();
    const [rows, setRows] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);

    const load = async () => {
        const qz = await api.get(`/quizzes/${id}`); setQuiz(qz.data);
        const { data } = await api.get(`/questions/quiz/${id}`);
        setRows((data.items || []).map(r => ({
            ...r,
            options: r.options ? JSON.parse(r.options) : r.options,
            tags: r.tags ? JSON.parse(r.tags) : []
        })));
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

    const cols = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'position', headerName: '#', width: 70 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'text', headerName: 'Question', flex: 1 },
        { field: 'difficulty', headerName: 'Diff', width: 100 },
        { field: 'tags', headerName: 'Tags', width: 220, renderCell: (p) => (p.value || []).map(t => <Chip key={t} size="small" label={t} sx={{ mr: .5 }} />) }
    ], []);

    const onDelete = async (qid) => {
        try {
            await api.delete(`/questions/${qid}`);
            toast('Question deleted', { variant: 'success' });
            load();
        } catch (e) { console.error(e); }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>Questions — {quiz?.title}</Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEdit(null); setOpen(true); }}>Add Question</Button>
                </Stack>
            </Stack>
            <div style={{ height: "calc(100vh - 175px)", width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={[
                        ...cols,
                        {
                            field: 'actions', headerName: 'Actions', width: 160, sortable: false,
                            renderCell: (p) => (
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" startIcon={<EditIcon />} onClick={() => { setEdit(p.row); setOpen(true); }}>Edit</Button>
                                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(p.row.id)}>Delete</Button>
                                </Stack>
                            )
                        }
                    ]}
                    pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                />
            </div>

            <QuestionDialog open={open} onClose={() => setOpen(false)} quizId={id} edit={edit} onSaved={() => { setOpen(false); load(); }} />
        </Box>
    );
}

function QuestionDialog({ open, onClose, quizId, edit, onSaved }) {
    const [form, setForm] = useState({ type: 'mcq', text: '', options: [], correct: [], explanation: '', tags: [], difficulty: '', position: 1 });

    useEffect(() => {
        if (edit) {
            setForm({
                type: edit.type, text: edit.text,
                options: edit.options || [],
                correct: [],
                explanation: edit.explanation || '',
                tags: edit.tags || [],
                difficulty: edit.difficulty || '',
                position: edit.position || 1
            });
        } else setForm({ type: 'mcq', text: '', options: [], correct: [], explanation: '', tags: [], difficulty: '', position: 1 });
    }, [edit]);

    const save = async () => {
        const payload = { quiz_id: Number(quizId), ...form };
        if (!payload.text) { toast('Question text is required', { variant: 'warning' }); return; }
        try {
            if (edit) { await api.put(`/questions/${edit.id}`, payload); toast('Question updated', { variant: 'success' }); }
            else { await api.post('/questions', payload); toast('Question created', { variant: 'success' }); }
            onSaved();
        } catch (e) { console.error(e); }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{edit ? 'Edit' : 'Add'} Question</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <TextField select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        {TYPES.map(t => <MenuItem key={t} value={t}>{t.toUpperCase()}</MenuItem>)}
                    </TextField>
                    <TextField label="Question text" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} multiline minRows={2} />
                    {form.type === 'mcq' ? (
                        <>
                            <TextField label="Options (comma separated)" value={form.options.join(',')}
                                onChange={e => setForm({ ...form, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                            <TextField label="Correct (comma separated)" value={form.correct.join(',')}
                                onChange={e => setForm({ ...form, correct: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                        </>
                    ) : (
                        <TextField label="Correct answer" value={form.correct[0] || ''}
                            onChange={e => setForm({ ...form, correct: [e.target.value] })} />
                    )}
                    <TextField label="Explanation" value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} multiline minRows={2} />
                    <TextField label="Tags (comma)" value={form.tags.join(',')}
                        onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    <Stack direction="row" spacing={2}>
                        <TextField label="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} />
                        <TextField type="number" label="Position" value={form.position} onChange={e => setForm({ ...form, position: Number(e.target.value || 1) })} />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={save}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}
