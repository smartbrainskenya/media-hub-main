-- Initial Schema for Smart Brains Media Hub

-- 6.2 admin_users
CREATE TABLE admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6.1 media_assets
CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publitio_id     TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('image', 'video')),
  branded_url     TEXT NOT NULL,
  file_hash       TEXT,
  file_size_bytes BIGINT,
  width_px        INTEGER,
  height_px       INTEGER,
  duration_secs   INTEGER,         -- for video only
  uploaded_by     UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_assets_type ON media_assets(type);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);

-- 6.3 audit_log
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES admin_users(id),
  action      TEXT NOT NULL CHECK (action IN ('upload', 'import', 'rename', 'replace', 'delete')),
  media_id    UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- 6.4 updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
