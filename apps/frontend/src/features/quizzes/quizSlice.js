import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchQuizzes = createAsyncThunk('quizzes/list', async () => {
    const { data } = await api.get('/quizzes');
    return data.items || [];
});

export const fetchQuiz = createAsyncThunk('quizzes/one', async (idOrSlug) => {
    const { data } = await api.get(`/quizzes/${idOrSlug}`);
    return data;
});

export const fetchQuizQuestions = createAsyncThunk('quizzes/questions', async (quizId) => {
    const { data } = await api.get(`/quizzes/${quizId}/questions`);
    return data.items || [];
});

const slice = createSlice({
    name: 'quizzes',
    initialState: { list: [], current: null, questions: [], status: 'idle', qStatus: 'idle' },
    reducers: { clearCurrent: s => { s.current = null; s.questions = []; } },
    extraReducers: b => {
        b.addCase(fetchQuizzes.fulfilled, (s, a) => { s.list = a.payload; s.status = 'succeeded'; });
        b.addCase(fetchQuiz.fulfilled, (s, a) => { s.current = a.payload; });
        b.addCase(fetchQuizQuestions.pending, (s) => { s.qStatus = 'loading'; });
        b.addCase(fetchQuizQuestions.fulfilled, (s, a) => { s.questions = a.payload; s.qStatus = 'succeeded'; });
        b.addCase(fetchQuizQuestions.rejected, (s) => { s.qStatus = 'failed'; });
    }
});
export const { clearCurrent } = slice.actions;
export default slice.reducer;
