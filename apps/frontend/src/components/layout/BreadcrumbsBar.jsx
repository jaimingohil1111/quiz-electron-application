import { Breadcrumbs, Link, Typography, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function BreadcrumbsBar({ items = [], right = null }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs aria-label="breadcrumb">
                {items.map((it, idx) =>
                    it.to && idx < items.length - 1 ? (
                        <Link key={idx} component={RouterLink} color="inherit" underline="hover" to={it.to}>
                            {it.label}
                        </Link>
                    ) : (
                        <Typography key={idx} color="text.primary">{it.label}</Typography>
                    )
                )}
            </Breadcrumbs>
            {right}
        </Stack>
    );
}
