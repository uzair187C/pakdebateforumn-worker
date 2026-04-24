-- migrations/001_init.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,            -- slug like "debate-2025-12"
  title TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  type TEXT NOT NULL,             -- 'text','email','phone','select','textarea','radio'
  required INTEGER DEFAULT 0,
  options TEXT,                   -- JSON string for select / radio options e.g. '["A","B"]'
  order_no INTEGER DEFAULT 0,
  FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer_text TEXT,
  FOREIGN KEY(response_id) REFERENCES responses(id) ON DELETE CASCADE,
  FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER,                 -- 1-5 star rating
  feedback_text TEXT NOT NULL,
  feedback_type TEXT,             -- 'event', 'website', 'general', etc
  submitted_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_event ON questions(event_id);
CREATE INDEX IF NOT EXISTS idx_responses_event ON responses(event_id);
CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_email ON feedbacks(email);
