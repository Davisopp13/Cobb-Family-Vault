-- Families
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  created_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  family_id TEXT NOT NULL REFERENCES families(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Sessions (Lucia Auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL
);

-- Sections (binder tabs)
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  family_id TEXT NOT NULL REFERENCES families(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Entries
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  family_id TEXT NOT NULL REFERENCES families(id),
  section_id TEXT NOT NULL REFERENCES sections(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_sensitive INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  deleted_at INTEGER
);

-- Entry History (edit audit trail)
CREATE TABLE IF NOT EXISTS entry_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  edited_by TEXT REFERENCES users(id),
  edited_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Invites
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  family_id TEXT NOT NULL REFERENCES families(id),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_section_id ON entries(section_id);
CREATE INDEX IF NOT EXISTS idx_entries_family_id ON entries(family_id);
CREATE INDEX IF NOT EXISTS idx_entries_updated_at ON entries(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sections_family_id ON sections(family_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
