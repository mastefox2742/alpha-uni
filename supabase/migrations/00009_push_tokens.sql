-- ============================================================
-- UniGest — Migration 00009 : Push tokens (notifications mobiles)
-- ============================================================

-- ─── Table push_tokens ────────────────────────────────────────────────────────
-- Un utilisateur peut avoir plusieurs appareils (iOS + Android + etc.)
CREATE TABLE push_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id  TEXT,                      -- Identifiant unique de l'appareil
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)                -- Un token ne peut pas être dupliqué pour un user
);

CREATE INDEX idx_push_tokens_user    ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active  ON push_tokens(user_id, is_active);

-- Trigger updated_at
CREATE TRIGGER trg_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- L'utilisateur gère seulement ses propres tokens
CREATE POLICY "push_tokens_own"
  ON push_tokens FOR ALL
  USING (user_id = auth.uid());

-- Les admins peuvent lire (pour debug et envoi)
CREATE POLICY "push_tokens_admin_read"
  ON push_tokens FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Fonction helper : upsert token ───────────────────────────────────────────
-- Utilisée par l'Edge Function et l'API pour enregistrer/mettre à jour un token
CREATE OR REPLACE FUNCTION upsert_push_token(
  p_user_id   UUID,
  p_token     TEXT,
  p_platform  TEXT,
  p_device_id TEXT DEFAULT NULL
)
RETURNS push_tokens
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result push_tokens;
BEGIN
  INSERT INTO push_tokens (user_id, token, platform, device_id, is_active)
  VALUES (p_user_id, p_token, p_platform, p_device_id, TRUE)
  ON CONFLICT (user_id, token)
  DO UPDATE SET
    is_active  = TRUE,
    platform   = EXCLUDED.platform,
    device_id  = EXCLUDED.device_id,
    updated_at = NOW()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

-- ─── Fonction helper : désactiver les anciens tokens ─────────────────────────
CREATE OR REPLACE FUNCTION deactivate_push_token(
  p_user_id UUID,
  p_token   TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE push_tokens
  SET    is_active = FALSE, updated_at = NOW()
  WHERE  user_id = p_user_id AND token = p_token;
END;
$$;
