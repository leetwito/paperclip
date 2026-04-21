ALTER TABLE agents ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'ai';
CREATE INDEX IF NOT EXISTS agents_company_kind_idx ON agents (company_id, kind);
