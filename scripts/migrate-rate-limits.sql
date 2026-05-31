-- Run this in the Supabase SQL editor once to set up rate limiting.

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT    NOT NULL,
  window_start BIGINT  NOT NULL,
  count        INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);

-- Atomic increment. Returns TRUE if the request is within the limit.
-- Probabilistically cleans up rows older than 2 hours (~2% of calls).
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key    TEXT,
  p_window BIGINT,
  p_limit  INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  IF random() < 0.02 THEN
    DELETE FROM rate_limits
    WHERE window_start < (EXTRACT(EPOCH FROM NOW())::BIGINT - 7200);
  END IF;

  INSERT INTO rate_limits (key, window_start, count)
  VALUES (p_key, p_window, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO new_count;

  RETURN new_count <= p_limit;
END;
$$;
