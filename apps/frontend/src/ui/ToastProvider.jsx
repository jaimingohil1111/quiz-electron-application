import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { setEnqueue } from './toast';

export default function ToastProvider({ children }) {
    const { enqueueSnackbar } = useSnackbar();
    useEffect(() => { setEnqueue(enqueueSnackbar); }, [enqueueSnackbar]);
    return children;
}
