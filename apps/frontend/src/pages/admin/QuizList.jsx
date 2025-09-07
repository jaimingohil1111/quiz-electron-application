import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../../features/quizzes/quizSlice';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

export default function QuizList() {
    const dispatch = useDispatch();
    const { list } = useSelector(s => s.quizzes);
    useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);
    return (
        <Box>
            <Typography variant="h5" gutterBottom>Quizzes</Typography>
            <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/admin/quizzes/new" sx={{ mb: 2 }}>
                New Quiz
            </Button>
            <List>
                {list.map(q => (
                    <ListItem key={q.id} divider
                        secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="edit" component={RouterLink} to={`/admin/quizzes/${q.id}`}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="questions" component={RouterLink} to={`/admin/quizzes/${q.id}/questions`} sx={{ ml: 1 }}>
                                    <QuestionAnswerIcon />
                                </IconButton>
                            </>
                        }>
                        <ListItemText primary={q.title} secondary={`Status: ${q.status}`} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
