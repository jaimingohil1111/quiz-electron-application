import { useEffect } from 'react';

export default function usePageTitle(title) {
    useEffect(() => {
        const app = import.meta.env.VITE_APP_NAME || 'Quiz Desktop';
        document.title = title ? `${title} · ${app}` : app;
    }, [title]);
}
