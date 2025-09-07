import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

export default function AuthLayout() {
    // Full viewport height; center the auth card
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                bgcolor: (t) => t.palette.mode === 'dark' ? 'background.default' : '#f6f6f9'
            }}
        >
            <Container maxWidth="sm">
                <Outlet />
            </Container>
        </Box>
    );
}
