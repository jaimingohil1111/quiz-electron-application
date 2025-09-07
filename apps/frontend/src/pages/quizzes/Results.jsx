import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import api from '../../api/axios';
import { Box, Card, CardContent, Typography, Stack, Button, Grid } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

export default function Results() {
    const { attemptId } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        (async () => {
            // fetch attempt (from my list)
            const resp = await api.get('/attempts');
            const att = (resp.data.items || []).find(a => String(a.id) === String(attemptId));
            setAttempt(att || null);

            // fetch backend-computed summary with breakdowns
            const sum = await api.get(`/attempts/${attemptId}/summary`);
            setSummary(sum.data.summary);
        })();
    }, [attemptId]);

    if (!attempt || !summary) return <Typography>Loading…</Typography>;

    const score = summary.score ?? attempt.score ?? 0;

    // Build chart datasets
    const tagLabels = (summary.byTag || []).map(x => x.label);
    const tagAccuracies = (summary.byTag || []).map(x => x.accuracy);

    const diffLabels = (summary.byDifficulty || []).map(x => x.label);
    const diffAccuracies = (summary.byDifficulty || []).map(x => x.accuracy);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Your Score</Typography>
                        <Typography variant="h2" sx={{ mt: 1 }}>{score}%</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Button component={RouterLink} to={`/review/${attempt.id}`}>Review Answers</Button>
                            <Button component={RouterLink} to="/quizzes" variant="contained">Back to Quizzes</Button>
                        </Stack>
                        <Box sx={{ mt: 2 }}>
                            <PieChart
                                series={[{
                                    data: [
                                        { id: 0, value: score, label: 'Correct' },
                                        { id: 1, value: Math.max(0, 100 - score), label: 'Incorrect' }
                                    ]
                                }]}
                                width={360}
                                height={240}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Accuracy by Tag</Typography>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: tagLabels }]}
                            series={[{ data: tagAccuracies, label: 'Accuracy %' }]}
                            height={260}
                            grid={{ horizontal: true }}
                            yAxis={[{ min: 0, max: 100 }]}
                        />
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Accuracy by Difficulty</Typography>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: diffLabels }]}
                            series={[{ data: diffAccuracies, label: 'Accuracy %' }]}
                            height={260}
                            grid={{ horizontal: true }}
                            yAxis={[{ min: 0, max: 100 }]}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
