module.exports = {
    auth: require('./auth.routes'),
    users: require('./users.routes'),        // will add next (admin-only user mgmt, optional)
    quizzes: require('./quizzes.routes'),    // admin CRUD + public list/view
    questions: require('./questions.routes'),// admin CRUD
    attempts: require('./attempts.routes')   // user attempt flow
};
