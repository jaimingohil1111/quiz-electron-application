import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Typography, Card, CardContent, Stack, Chip } from '@mui/material';

export default function Review() {
    const { attemptId } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        (async () => {
            const att = await api.get(`/attempts`); // list mine
            const found = (att.data.items || []).find(a => String(a.id) === String(attemptId));
            setAttempt(found);
            if (found) {
                const qs = await api.get(`/quizzes/${found.quiz_id}/questions`);
                setQuestions(qs.data.items || []);
            }
        })();
    }, [attemptId]);

    if (!attempt) return <Typography>Loading…</Typography>;
    const responses = attempt.responses ? JSON.parse(attempt.responses) : [];

    return (
        <Stack spacing={2}>
            <Typography variant="h5">Review — Attempt #{attempt.id}</Typography>
            {questions.map((q, i) => {
                const resp = responses.find(r => r.qId === q.id);
                return (
                    <Card key={q.id}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Q{i + 1}</Typography>
                            <Typography variant="h6" sx={{ mb: 1 }}>{q.text}</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {(resp?.answer || []).map(a => <Chip key={a} label={a} color="primary" />)}
                                {!resp && <Chip label="Not answered" color="default" variant="outlined" />}
                            </Stack>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
}
