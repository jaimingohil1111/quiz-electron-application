import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice';
import quizzes from '../features/quizzes/quizSlice';
import attempts from '../features/attempts/attemptSlice';

export default configureStore({
    reducer: { auth, quizzes, attempts }
});
