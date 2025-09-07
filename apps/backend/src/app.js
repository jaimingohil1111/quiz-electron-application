const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./config/env');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// api routes
app.use('/auth', routes.auth);
app.use('/users', routes.users);
app.use('/quizzes', routes.quizzes);
app.use('/questions', routes.questions);
app.use('/attempts', routes.attempts);

// error handler (last)
const { errorHandler } = require('./middleware/error');
app.use(errorHandler);

module.exports = app;
