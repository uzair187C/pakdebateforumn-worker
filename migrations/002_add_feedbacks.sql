-- migrations/002_add_feedbacks.sql
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER,
  feedback_text TEXT NOT NULL,
  feedback_type TEXT,
  submitted_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_email ON feedbacks(email);
