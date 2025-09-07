import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const startAttempt = createAsyncThunk('attempts/start', async (quizId) => {
    const { data } = await api.post('/attempts/start', { quizId });
    return data;
});

export const saveAnswer = createAsyncThunk('attempts/answer', async (payload) => {
    const { data } = await api.post('/attempts/answer', payload);
    return data.attempt;
});

export const submitAttempt = createAsyncThunk('attempts/submit', async (attemptId) => {
    const { data } = await api.post('/attempts/submit', { attemptId });
    return data; // { attempt, summary }
});

const slice = createSlice({
    name: 'attempts',
    initialState: { current: null, saving: false, result: null },
    reducers: { resetAttempt: s => { s.current = null; s.result = null; } },
    extraReducers: b => {
        b.addCase(startAttempt.fulfilled, (s, a) => { s.current = a.payload; s.result = null; });
        b.addCase(saveAnswer.pending, (s) => { s.saving = true; });
        b.addCase(saveAnswer.fulfilled, (s, a) => { s.saving = false; s.current = a.payload; });
        b.addCase(saveAnswer.rejected, (s) => { s.saving = false; });
        b.addCase(submitAttempt.fulfilled, (s, a) => { s.result = a.payload; });
    }
});
export const { resetAttempt } = slice.actions;
export default slice.reducer;
