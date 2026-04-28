-- Add asset requests for public request flow and admin request management

CREATE TABLE IF NOT EXISTS asset_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('image', 'video')),
  context     TEXT NOT NULL CHECK (context IN ('project', 'class')),
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_requests_created_at
  ON asset_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_requests_status_created_at
  ON asset_requests(status, created_at DESC);

DROP TRIGGER IF EXISTS set_asset_requests_updated_at ON asset_requests;

CREATE TRIGGER set_asset_requests_updated_at
  BEFORE UPDATE ON asset_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
