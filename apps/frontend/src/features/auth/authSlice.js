import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAccess, setRefresh } from '../../api/axios';

const userKey = 'authUser';
const loadUser = () => {
    try { const raw = localStorage.getItem(userKey); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
};

// helper to extract server message
const serverMessage = (err) =>
    err?.response?.data?.error || err?.response?.data?.message || err.message || 'Request failed';

// LOGIN -> /auth/login
export const login = createAsyncThunk(
    'auth/login',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/auth/login', payload);
            setAccess(data.accessToken); setRefresh(data.refreshToken);
            localStorage.setItem(userKey, JSON.stringify(data.user));
            return data.user;
        } catch (err) {
            return rejectWithValue(serverMessage(err));
        }
    }
);

// SIGNUP -> /auth/signup  (must include role)
export const signup = createAsyncThunk(
    'auth/signup',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/auth/signup', payload); // <— endpoint per your backend
            // if backend returns tokens & user on signup:
            if (data.accessToken && data.refreshToken && data.user) {
                setAccess(data.accessToken); setRefresh(data.refreshToken);
                localStorage.setItem(userKey, JSON.stringify(data.user));
                return data.user;
            }
            // else if backend returns only ok/user, adjust as needed
            if (data.user) {
                localStorage.setItem(userKey, JSON.stringify(data.user));
                return data.user;
            }
            return null;
        } catch (err) {
            return rejectWithValue(serverMessage(err));
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(userKey);
    return null;
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/users/me');
        localStorage.setItem(userKey, JSON.stringify(data));
        return data;
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Failed to load profile';
        return rejectWithValue(msg);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: loadUser(), status: 'idle', error: null },
    reducers: {},
    extraReducers: (b) => {
        // login
        b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; });
        b.addCase(login.fulfilled, (s, a) => { s.status = 'succeeded'; s.user = a.payload; });
        b.addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error.message; });

        // signup
        b.addCase(signup.pending, (s) => { s.status = 'loading'; s.error = null; });
        b.addCase(signup.fulfilled, (s, a) => { s.status = 'succeeded'; s.user = a.payload; });
        b.addCase(signup.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error.message; });

        // logout
        b.addCase(logout.fulfilled, (s) => { s.user = null; s.status = 'idle'; s.error = null; });

        b.addCase(fetchMe.pending, (s) => { s.status = 'loading'; s.error = null; });
        b.addCase(fetchMe.fulfilled, (s, a) => { s.status = 'succeeded'; s.user = a.payload; });
        b.addCase(fetchMe.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error.message; });

    }
});

export default authSlice.reducer;
