-- users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- questions
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);

-- attempts
CREATE INDEX IF NOT EXISTS idx_attempts_user_quiz ON attempts(user_id, quiz_id, started_at DESC);

-- quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_cat_diff ON quizzes(category, difficulty);
