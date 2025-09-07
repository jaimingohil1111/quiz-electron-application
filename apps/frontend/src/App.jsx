import { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { getTheme } from './theme';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import ShellLayout from './layouts/ShellLayout';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// App pages
import Dashboard from './pages/dashboard/Dashboard';
import Browse from './pages/quizzes/Browse';
import QuizDetails from './pages/quizzes/QuizDetails';
import TakeQuiz from './pages/quizzes/TakeQuiz';
import Review from './pages/quizzes/Review';
import Results from './pages/quizzes/Results';
import AdminHome from './pages/admin/AdminHome';
import QuizList from './pages/admin/QuizList';
import QuizEditor from './pages/admin/QuizEditor';
import QuestionManager from './pages/admin/QuestionManager';
import SettingsPage from './pages/settings/Settings';
import UsersList from './pages/admin/users/UsersList';
import UserEditor from './pages/admin/users/UserEditor';

const THEME_KEY = 'themeMode';
const DENSITY_KEY = 'gridDensity';
const APP_TITLE_KEY = 'appTitleOverride';

export default function App() {
  const { user } = useSelector(s => s.auth);

  // Global theme + density for entire app (auth screens included)
  const [mode, setMode] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [density, setDensity] = useState(() => localStorage.getItem(DENSITY_KEY) || 'compact');
  const [appTitle, setAppTitle] = useState(() =>
    localStorage.getItem(APP_TITLE_KEY) || (import.meta.env.VITE_APP_NAME || 'Quiz Desktop')
  );

  const theme = useMemo(() => getTheme(mode, density), [mode, density]);

  // Listen to settings updates fired from Settings page
  useEffect(() => {
    const handler = (e) => {
      const { themeMode, gridDensity, appTitleOverride } = e.detail || {};
      if (themeMode) {
        localStorage.setItem(THEME_KEY, themeMode);
        setMode(themeMode);
      }
      if (gridDensity) {
        localStorage.setItem(DENSITY_KEY, gridDensity);
        setDensity(gridDensity);
      }
      if (typeof appTitleOverride !== 'undefined') {
        const title = appTitleOverride || (import.meta.env.VITE_APP_NAME || 'Quiz Desktop');
        localStorage.setItem(APP_TITLE_KEY, appTitleOverride || '');
        setAppTitle(title);
      }
    };
    window.addEventListener('prefs:updated', handler);
    return () => window.removeEventListener('prefs:updated', handler);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {!user ? (
        // ---------- AUTH LAYOUT (no header/drawer) ----------
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          {/* when not authed, everything else -> /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        // ---------- APP SHELL (header + drawer) ----------
        <Routes>
          <Route element={<ShellLayout appTitle={appTitle} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quizzes" element={<Browse />} />
            <Route path="/quizzes/:idOrSlug" element={<QuizDetails />} />

            <Route path="/play/:quizId" element={<TakeQuiz />} />
            <Route path="/review/:attemptId" element={<Review />} />
            <Route path="/results/:attemptId" element={<Results />} />

            {/* Admin zone */}
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/quizzes" element={<QuizList />} />
            <Route path="/admin/quizzes/new" element={<QuizEditor />} />
            <Route path="/admin/quizzes/:id" element={<QuizEditor />} />
            <Route path="/admin/quizzes/:id/questions" element={<QuestionManager />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/users/new" element={<UserEditor />} />
            <Route path="/admin/users/:id" element={<UserEditor />} />

            {/* Settings (after login) */}
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </ThemeProvider>
  );
}
