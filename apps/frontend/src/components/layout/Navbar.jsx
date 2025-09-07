import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

export default function Navbar() {
    const { user } = useSelector(s => s.auth);
    const nav = useNavigate();
    const dispatch = useDispatch();
    return (
        <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #eee' }}>
            <Link to="/">Home</Link>
            <Link to="/quizzes">Quizzes</Link>
            {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
            <div style={{ marginLeft: 'auto' }}>
                {user ? (
                    <>
                        <span style={{ marginRight: 8 }}>Hi, {user.name}</span>
                        <button onClick={() => { dispatch(logout()); nav('/login'); }}>Logout</button>
                    </>
                ) : <Link to="/login">Login</Link>}
            </div>
        </nav>
    );
}
