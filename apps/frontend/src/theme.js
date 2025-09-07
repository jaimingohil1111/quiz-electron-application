import { createTheme } from '@mui/material/styles';

// density: 'compact' | 'standard' | 'comfortable'
export const getTheme = (mode = 'light', density = 'compact') =>
    createTheme({
        palette: {
            mode,
            primary: { main: '#6750A4' },
            secondary: { main: '#00A6FB' }
        },
        shape: { borderRadius: 12 },
        components: {
            MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } } },
            MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
            // DataGrid global defaults, density controlled by settings
            MuiDataGrid: {
                defaultProps: {
                    density,
                    disableRowSelectionOnClick: true
                },
                styleOverrides: {
                    root: { borderRadius: 12 },
                    columnHeaders: { backgroundColor: 'rgba(0,0,0,0.04)' },
                    row: { '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }
                }
            }
        }
    });
