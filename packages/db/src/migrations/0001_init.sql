-- users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','user')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  tags TEXT,                 -- JSON array of strings
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  time_limit_sec INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- questions
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mcq','tf','fib')),
  text TEXT NOT NULL,
  options TEXT,              -- JSON array (for mcq)
  correct TEXT,              -- JSON array / scalar depending on type
  explanation TEXT,
  tags TEXT,                 -- JSON array
  difficulty TEXT,
  position INTEGER,          -- order within quiz
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- attempts
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  responses TEXT,            -- JSON array: [{qId, answer, timeMs, flagged}]
  score REAL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT
);

-- schema meta
CREATE TABLE IF NOT EXISTS _schema_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  schema_version INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO _schema_meta (id, schema_version) VALUES (1, 1);
