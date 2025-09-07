import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuiz, fetchQuizQuestions } from '../../features/quizzes/quizSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Chip, Stack, Button, Divider, Skeleton } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import CategoryIcon from '@mui/icons-material/Category';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import BreadcrumbsBar from '../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../hooks/usePageTitle';

export default function QuizDetails() {
    const { idOrSlug } = useParams();
    const nav = useNavigate();
    const dispatch = useDispatch();
    const { current, questions, qStatus } = useSelector(s => s.quizzes);

    usePageTitle(current?.title || 'Quiz');

    useEffect(() => { dispatch(fetchQuiz(idOrSlug)); }, [dispatch, idOrSlug]);
    useEffect(() => { if (current?.id) dispatch(fetchQuizQuestions(current.id)); }, [dispatch, current?.id]);

    const loading = !current || qStatus === 'loading';

    if (loading) {
        return (
            <>
                <BreadcrumbsBar items={[
                    { label: 'Home', to: '/' },
                    { label: 'Quizzes', to: '/quizzes' },
                    { label: 'Loading…' }
                ]} />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}><Skeleton variant="rounded" height={220} /></Grid>
                    <Grid item xs={12} md={4}><Skeleton variant="rounded" height={220} /></Grid>
                    <Grid item xs={12}><Skeleton variant="rounded" height={180} /></Grid>
                </Grid>
            </>
        );
    }

    const tags = current.tags ? JSON.parse(current.tags || '[]') : [];
    const qCount = questions?.length || 0;

    return (
        <>
            <BreadcrumbsBar
                items={[
                    { label: 'Home', to: '/' },
                    { label: 'Quizzes', to: '/quizzes' },
                    { label: current.title }
                ]}
            />

            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">{current.title}</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                {current.description || 'No description provided.'}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                                {current.category && <Chip icon={<CategoryIcon />} label={current.category} />}
                                {current.difficulty && <Chip icon={<SignalCellularAltIcon />} label={current.difficulty} color="secondary" variant="outlined" />}
                                {current.time_limit_sec ? (
                                    <Chip icon={<AccessTimeIcon />} label={`${Math.floor(current.time_limit_sec / 60)} min`} color="primary" />
                                ) : <Chip icon={<AccessTimeIcon />} label="No time limit" variant="outlined" />}
                                <Chip icon={<TagIcon />} label={`${qCount} questions`} />
                            </Stack>

                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<PlayCircleIcon />}
                                    onClick={() => nav(`/play/${current.id}`)}
                                >
                                    Start Quiz
                                </Button>
                                <Button variant="outlined" onClick={() => nav('/quizzes')}>Back</Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Highlights</Typography>
                            <Stack spacing={1}>
                                <Typography variant="body2"><b>Status:</b> {current.status}</Typography>
                                <Typography variant="body2"><b>Category:</b> {current.category || 'General'}</Typography>
                                <Typography variant="body2"><b>Difficulty:</b> {current.difficulty || 'N/A'}</Typography>
                                <Typography variant="body2"><b>Time limit:</b> {current.time_limit_sec ? `${current.time_limit_sec} sec` : 'None'}</Typography>
                                <Typography variant="body2">
                                    <b>Tags:</b>{' '}
                                    {tags.length ? tags.map(t => <Chip key={t} size="small" label={t} sx={{ mr: .5 }} />) : '—'}
                                </Typography>
                                <Typography variant="body2"><b>Created:</b> {new Date(current.created_at).toLocaleString()}</Typography>
                                <Typography variant="body2"><b>Updated:</b> {new Date(current.updated_at).toLocaleString()}</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>What to expect</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Answer the questions in any order. Use flags to mark questions for review. Your answers are auto-saved as you navigate.
                                {current.time_limit_sec ? ' This quiz has a timer — it will auto-submit when time runs out.' : ' There is no time limit for this quiz.'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
