import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../../features/quizzes/quizSlice';
import { Grid, Card, CardContent, CardActions, Button, Typography, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Browse() {
    const dispatch = useDispatch();
    const nav = useNavigate();
    const { list } = useSelector(s => s.quizzes);
    useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);

    return (
        <>
            <Typography variant="h5" gutterBottom>Available Quizzes</Typography>
            <Grid container spacing={2}>
                {list.map(q => (
                    <Grid item xs={12} sm={6} md={4} key={q.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{q.title}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{q.description}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                                    {q.category && <Chip size="small" label={q.category} />}
                                    {q.difficulty && <Chip size="small" label={q.difficulty} color="secondary" variant="outlined" />}
                                </Stack>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Button onClick={() => nav(`/quizzes/${q.slug || q.id}`)} size="small">Open</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
