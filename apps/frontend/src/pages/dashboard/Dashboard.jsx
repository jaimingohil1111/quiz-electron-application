import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuizzes } from '../../features/quizzes/quizSlice';
import api from '../../api/axios';
import { Grid, Card, CardContent, Typography, LinearProgress, Stack, Button, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import BreadcrumbsBar from '../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../hooks/usePageTitle';

export default function Dashboard() {
    usePageTitle('Dashboard');

    const { user } = useSelector(s => s.auth);
    const { list } = useSelector(s => s.quizzes);
    const dispatch = useDispatch();

    const [attempts, setAttempts] = useState([]);
    const lastScore = useMemo(() => attempts[0]?.score ?? null, [attempts]);

    useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/attempts');
                setAttempts(data.items || []);
            } catch (e) { console.error(e); }
        })();
    }, []);

    return (
        <>
            <BreadcrumbsBar items={[{ label: 'Home' }]} />

            <Typography variant="h5" sx={{ mb: 2 }}>
                Welcome {user ? user.name : 'Guest'}
            </Typography>

            <Grid container spacing={2}>
                {/* Available quizzes */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <QuizIcon color="primary" />
                                <div>
                                    <Typography variant="subtitle2" color="text.secondary">Available Quizzes</Typography>
                                    <Typography variant="h4">{list.length}</Typography>
                                </div>
                            </Stack>
                            <Button component={RouterLink} to="/quizzes" sx={{ mt: 2 }} variant="contained" startIcon={<PlayCircleIcon />}>
                                Browse Quizzes
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Last score */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <AssessmentIcon color="secondary" />
                                <div style={{ flex: 1 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Last Attempt Score</Typography>
                                    <Typography variant="h4">{lastScore !== null ? `${lastScore}%` : '--'}</Typography>
                                    <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, lastScore ?? 0))} sx={{ mt: 1 }} />
                                </div>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Chip size="small" label="Practice" />
                                <Chip size="small" label="Improve" color="success" variant="outlined" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick actions */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Quick Actions</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Button variant="outlined" component={RouterLink} to="/quizzes">Take a Quiz</Button>
                                {user?.role === 'admin' && (
                                    <>
                                        <Button variant="outlined" component={RouterLink} to="/admin/quizzes">Manage Quizzes</Button>
                                        <Button variant="outlined" component={RouterLink} to="/admin/quizzes/new">Create Quiz</Button>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent attempts */}
                <Grid item xs={12} md={6} width={'25%'}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Recent Attempts</Typography>
                        </CardContent>
                        <Divider />
                        <List dense>
                            {(attempts.slice(0, 6)).map(a => (
                                <ListItem
                                    key={a.id}
                                    secondaryAction={
                                        <Chip size="small" label={`${a.score ?? 0}%`} color={(a.score ?? 0) >= 60 ? 'success' : 'default'} />
                                    }
                                >
                                    <ListItemText primary={`Attempt #${a.id}`} secondary={new Date(a.started_at).toLocaleString()} />
                                </ListItem>
                            ))}
                            {!attempts.length && <ListItem><ListItemText primary="No attempts yet — take your first quiz!" /></ListItem>}
                        </List>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
