import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { ROLES } from '../utils/roles';

export default function AdminRoute() {
    const { user } = useSelector(s => s.auth);
    if (!user) return <Navigate to="/login" replace />;
    return user.role === ROLES.ADMIN ? <Outlet /> : <Navigate to="/" replace />;
}
