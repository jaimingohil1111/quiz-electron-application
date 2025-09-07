import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuiz, fetchQuizQuestions } from '../../features/quizzes/quizSlice';
import { startAttempt, saveAnswer, submitAttempt } from '../../features/attempts/attemptSlice';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Stack, Button, Chip, LinearProgress, Grid,
    IconButton, Tooltip, Divider, Alert, TextField
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import CheckIcon from '@mui/icons-material/Check';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { toast } from '../../ui/toast';

export default function TakeQuiz() {
    const { quizId } = useParams();
    const dispatch = useDispatch();
    const nav = useNavigate();
    const { current, questions } = useSelector(s => s.quizzes);
    const { current: attempt, result } = useSelector(s => s.attempts);

    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState([]); // always single-element array or []
    const [flags, setFlags] = useState({});
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);

    // 🚫 React 18 StrictMode double-mount protection to avoid creating 2 attempts
    const startedRef = useRef(false);

    const q = useMemo(() => questions[index], [questions, index]);
    const total = questions.length;
    const remaining = Math.max((current?.time_limit_sec || 0) - elapsed, 0);
    const percent = current?.time_limit_sec ? Math.min(100, Math.round((elapsed / current.time_limit_sec) * 100)) : 0;

    useEffect(() => {
        (async () => {
            // guard against double invocation
            if (startedRef.current) return;
            startedRef.current = true;

            await dispatch(fetchQuiz(Number(quizId)));
            await dispatch(fetchQuizQuestions(Number(quizId)));

            const res = await dispatch(startAttempt(Number(quizId)));
            if (res.meta.requestStatus !== 'fulfilled') return;

            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
            toast('Attempt started', { variant: 'info' });
        })();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [dispatch, quizId]);

    useEffect(() => {
        if (current?.time_limit_sec && elapsed >= current.time_limit_sec) {
            toast('Time is up! Submitting...', { variant: 'warning' });
            onSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elapsed, current]);

    if (!current || !q) return <Typography>Loading…</Typography>;
    if (result) { nav(`/results/${attempt.id}`); return null; }

    const onSave = async () => {
        // always send a single-value array (or empty) to the API
        const res = await dispatch(saveAnswer({
            attemptId: attempt.id,
            qId: q.id,
            answer: selected.length ? [selected[0]] : [],
            timeMs: 0,
            flagged: !!flags[q.id]
        }));
        if (res.meta.requestStatus === 'fulfilled') toast('Answer saved', { variant: 'success' });
    };

    const go = async (dir) => {
        await onSave();
        setSelected([]);
        setIndex(i => Math.min(Math.max(0, i + dir), total - 1));
    };

    const onSubmit = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        await onSave();
        const res = await dispatch(submitAttempt(attempt.id));
        if (res.meta.requestStatus === 'fulfilled') toast('Attempt submitted', { variant: 'success' });
        nav(`/results/${attempt.id}`);
    };

    const toggleFlag = () => setFlags(prev => ({ ...prev, [q.id]: !prev[q.id] }));

    // Single-select handlers for every type
    const pick = (val) => setSelected([val]); // normalize to array with exactly one element

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>{current.title}</Typography>
                            {current.time_limit_sec ? (
                                <Stack sx={{ minWidth: 240 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Time left: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                                    </Typography>
                                    <LinearProgress variant="determinate" value={percent} />
                                </Stack>
                            ) : null}
                        </Stack>

                        <Typography variant="subtitle2" color="text.secondary">Question {index + 1} of {total}</Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>{q.text}</Typography>

                        <Box sx={{ mt: 2 }}>
                            {/* MCQ now behaves as SINGLE-SELECT */}
                            {q.type === 'mcq' && (
                                <Stack spacing={1}>
                                    {q.options?.map(opt => {
                                        const checked = selected[0] === opt;
                                        return (
                                            <Chip
                                                key={opt}
                                                label={opt}
                                                variant={checked ? 'filled' : 'outlined'}
                                                color={checked ? 'primary' : 'default'}
                                                onClick={() => pick(opt)}
                                                icon={checked ? <CheckIcon /> : null}
                                                sx={{ justifyContent: 'flex-start', p: 1 }}
                                            />
                                        );
                                    })}
                                </Stack>
                            )}
                            {q.type === 'tf' && (
                                <Stack direction="row" spacing={1}>
                                    {['true', 'false'].map(v => (
                                        <Chip key={v} label={v.toUpperCase()} clickable
                                            color={selected[0] === v ? 'primary' : 'default'}
                                            onClick={() => pick(v)} />
                                    ))}
                                </Stack>
                            )}
                            {q.type === 'fib' && (
                                <TextField fullWidth label="Your answer" value={selected[0] || ''}
                                    onChange={e => pick(e.target.value)} />
                            )}
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                            <Tooltip title={flags[q.id] ? 'Unflag' : 'Flag for review'}>
                                <IconButton color={flags[q.id] ? 'warning' : 'default'} onClick={toggleFlag}><FlagIcon /></IconButton>
                            </Tooltip>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button startIcon={<NavigateBeforeIcon />} disabled={index === 0} onClick={() => go(-1)}>Previous</Button>
                            <Button endIcon={<NavigateNextIcon />} disabled={index === total - 1} onClick={() => go(1)}>Next</Button>
                            <Button variant="contained" onClick={onSubmit}>Submit</Button>
                        </Stack>

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Single selection is enforced for all questions. Answers are auto-saved when you navigate or submit.
                        </Alert>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>Quick Navigator</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {questions.map((qq, i) => (
                                <Button key={qq.id} size="small" variant={i === index ? 'contained' : 'outlined'}
                                    color={flags[qq.id] ? 'warning' : 'primary'}
                                    onClick={async () => { await onSave(); setIndex(i); }}>
                                    {i + 1}
                                </Button>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
