import { useEffect, useMemo, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Stack, Button, TextField, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { toast } from '../../../ui/toast';
import BreadcrumbsBar from '../../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../../hooks/usePageTitle';
import SetPasswordDialog from './SetPasswordDialog';

export default function UsersList() {
    usePageTitle('Users');

    const nav = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState('');
    const [pwdUser, setPwdUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { limit: pageSize, offset: page * pageSize };
            if (query?.trim()) params.q = query.trim(); // backend may ignore if unsupported
            const { data } = await api.get('/users', { params });
            const items = data.items || data || []; // support either shape
            setRows(items.map(u => ({
                id: u.id, name: u.name, email: u.email, role: u.role,
                created_at: u.created_at
            })));
        } catch (e) {
            console.error(e);
            // interceptor shows toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [page, pageSize]);
    const onSearch = () => { setPage(0); fetchUsers(); };

    const onDelete = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            toast('User deleted', { variant: 'success' });
            fetchUsers();
        } catch (e) { console.error(e); }
    };

    const cols = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
        { field: 'role', headerName: 'Role', width: 120 },
        {
            field: 'created_at', headerName: 'Created', width: 170,
            renderCell: ({ value }) => value ? new Date(value).toLocaleString() : ''
        },
        {
            field: 'actions', headerName: 'Actions', width: 200, sortable: false,
            renderCell: (p) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit">
                        <IconButton size="small" component={RouterLink} to={`/admin/users/${p.row.id}`}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Set password">
                        <IconButton size="small" onClick={() => setPwdUser(p.row)}><KeyIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => onDelete(p.row.id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], []);

    return (
        <>
            <BreadcrumbsBar
                items={[{ label: 'Home', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Users' }]}
                right={
                    <Stack direction="row" spacing={1}>
                        <TextField size="small" placeholder="Search name/email" value={query} onChange={e => setQuery(e.target.value)} />
                        <Button variant="outlined" onClick={onSearch}>Search</Button>
                    </Stack>
                }
            />

            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">All Users</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => nav('/admin/users/new')}>New User</Button>
                    </Stack>
                    <div style={{ height: "calc(100vh - 265px)", width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={cols}
                            loading={loading}
                            pagination
                            paginationModel={{ page, pageSize }}
                            onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
                            pageSizeOptions={[10, 25, 50]}
                        />
                    </div>
                </CardContent>
            </Card>

            <SetPasswordDialog
                user={pwdUser}
                open={!!pwdUser}
                onClose={() => setPwdUser(null)}
                onSaved={() => { setPwdUser(null); fetchUsers(); }}
            />
        </>
    );
}
