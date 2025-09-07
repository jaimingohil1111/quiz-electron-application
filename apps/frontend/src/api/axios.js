// apps/frontend/src/api/axios.js
import axios from 'axios';
import { toast } from '../ui/toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5050',
    withCredentials: false
});

const TK = 'accessToken';
const RTK = 'refreshToken';

export const getAccess = () => localStorage.getItem(TK);
export const setAccess = (t) => localStorage.setItem(TK, t || '');
export const getRefresh = () => localStorage.getItem(RTK);
export const setRefresh = (t) => localStorage.setItem(RTK, t || '');

// If running under Electron, ask preload for the local backend URL once and swap it in.
(async () => {
    try {
        if (typeof window !== 'undefined' && window.electronAPI?.getBaseUrl) {
            const url = await window.electronAPI.getBaseUrl();
            if (url) api.defaults.baseURL = url;
        }
    } catch {
        // ignore — falls back to VITE_API_BASE / localhost
    }
})();

api.interceptors.request.use((cfg) => {
    const t = getAccess();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

let refreshing = null;

api.interceptors.response.use(
    (r) => r,
    async (err) => {
        const original = err.config || {};
        const status = err.response?.status;
        const msg = err.response?.data?.error || err.message || 'Request failed';

        // Show toast for non-401 errors
        if (status && status !== 401) {
            toast(msg, { variant: 'error' });
        }

        // Handle token refresh once
        if (status === 401 && !original._retry) {
            original._retry = true;
            try {
                refreshing =
                    refreshing ||
                    axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                        refreshToken: getRefresh()
                    });

                const { data } = await refreshing;
                refreshing = null;

                setAccess(data.accessToken);
                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${data.accessToken}`;

                return api(original);
            } catch (e) {
                console.error(e);
                refreshing = null;
                localStorage.removeItem(TK);
                localStorage.removeItem(RTK);
                toast('Session expired. Please sign in again.', { variant: 'warning' });
                // Hard redirect to login (works in web & Electron)
                window.location.href = '/login';
            }
        }

        throw err;
    }
);

export default api;
