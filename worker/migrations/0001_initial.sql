CREATE TABLE issues (
  number        INTEGER PRIMARY KEY,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  author        TEXT NOT NULL,
  author_avatar TEXT,
  created_at    TEXT NOT NULL,
  body          TEXT,
  labels        TEXT NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','done','skipped','archived','needs-attention','in-discussion')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by    TEXT
);

CREATE TABLE triage_analysis (
  issue_number    INTEGER PRIMARY KEY REFERENCES issues(number),
  type            TEXT,
  component       TEXT,
  priority        TEXT,
  completeness    INTEGER,
  summary         TEXT,
  classification  TEXT,
  checklist       TEXT,
  suggested_labels TEXT,
  suggested_action TEXT,
  suggested_comment TEXT,
  investigation    TEXT,
  analyzed_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE activity_log (
  id            TEXT PRIMARY KEY,
  timestamp     TEXT NOT NULL,
  issue_number  INTEGER REFERENCES issues(number),
  issue_title   TEXT,
  actor         TEXT,
  action        TEXT NOT NULL,
  details       TEXT
);

CREATE TABLE scan_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at  TEXT NOT NULL,
  finished_at TEXT,
  issues_found   INTEGER,
  issues_new     INTEGER,
  issues_updated INTEGER,
  status      TEXT DEFAULT 'running' CHECK (status IN ('running','completed','failed')),
  error       TEXT
);

CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_updated ON issues(updated_at);
CREATE INDEX idx_activity_timestamp ON activity_log(timestamp);
CREATE INDEX idx_activity_issue ON activity_log(issue_number);
