import { Link as RouterLink } from 'react-router-dom';
import { Grid, Card, CardActionArea, CardContent, Typography, Stack, Chip, Button } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import SettingsIcon from '@mui/icons-material/Settings';
import BreadcrumbsBar from '../../components/layout/BreadcrumbsBar';
import usePageTitle from '../../hooks/usePageTitle';
import PeopleIcon from '@mui/icons-material/People';

export default function AdminHome() {
    usePageTitle('Admin Console');

    return (
        <>
            <BreadcrumbsBar
                items={[{ label: 'Home', to: '/' }, { label: 'Admin' }]}
            />

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardActionArea component={RouterLink} to="/admin/quizzes">
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <QuizIcon fontSize="large" color="primary" />
                                    <div>
                                        <Typography variant="h6">Quizzes</Typography>
                                        <Typography variant="body2" color="text.secondary">View, publish, and maintain quizzes</Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip size="small" label="Drafts" />
                                            <Chip size="small" label="Published" color="success" variant="outlined" />
                                        </Stack>
                                    </div>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardActionArea component={RouterLink} to="/admin/quizzes/new">
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <AddCircleIcon fontSize="large" color="secondary" />
                                    <div>
                                        <Typography variant="h6">Create Quiz</Typography>
                                        <Typography variant="body2" color="text.secondary">Build a new quiz and add questions</Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip size="small" label="MCQ" />
                                            <Chip size="small" label="True/False" />
                                            <Chip size="small" label="FIB" />
                                        </Stack>
                                    </div>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardActionArea component={RouterLink} to="/settings">
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <SettingsIcon fontSize="large" />
                                    <div>
                                        <Typography variant="h6">Settings</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Theme, profile, admin preferences
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                                            <Chip size="small" label="Theme" />
                                            <Chip size="small" label="Profile" />
                                            <Chip size="small" label="Admin" />
                                        </Stack>
                                    </div>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardActionArea component={RouterLink} to="/admin/users">
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <PeopleIcon fontSize="large" color="primary" />
                                    <div>
                                        <Typography variant="h6">Users</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Create, edit, reset passwords, and remove users
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip size="small" label="Admin" />
                                            <Chip size="small" label="User" />
                                        </Stack>
                                    </div>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
