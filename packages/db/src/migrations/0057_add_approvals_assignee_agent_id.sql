-- Step 1: add column nullable first so we can backfill
ALTER TABLE approvals ADD COLUMN assignee_agent_id UUID REFERENCES agents(id);

-- Step 2: backfill existing approvals to each company's CEO agent (role='ceo')
UPDATE approvals a
SET assignee_agent_id = (
  SELECT id FROM agents
  WHERE company_id = a.company_id AND role = 'ceo'
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE assignee_agent_id IS NULL;

-- Step 3: for companies with no CEO agent, fall back to their oldest agent
UPDATE approvals a
SET assignee_agent_id = (
  SELECT id FROM agents
  WHERE company_id = a.company_id
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE assignee_agent_id IS NULL;

-- Step 4: enforce NOT NULL
ALTER TABLE approvals ALTER COLUMN assignee_agent_id SET NOT NULL;

-- Step 5: index for inbox filtering
CREATE INDEX IF NOT EXISTS approvals_company_assignee_status_idx
  ON approvals (company_id, assignee_agent_id, status);
