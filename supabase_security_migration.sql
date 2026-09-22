-- ============================================================
-- MIGRAÇÃO DE SEGURANÇA — Bartender de Bolso
-- Rodar no Supabase SQL Editor (dashboard → SQL Editor → New query)
-- ============================================================

-- 1. Adicionar colunas de controle em profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_premium    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS streak_current    INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_longest    INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_date  TEXT;

-- 2. Marcar o admin (substitua pelo UUID real do seu usuário)
-- Para achar o UUID: vá em Authentication → Users → copie o ID do lucas_doti@hotmail.com
UPDATE profiles SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'lucas_doti@hotmail.com' LIMIT 1
);

-- ============================================================
-- 3. RLS — profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;

-- Usuário vê só a própria linha
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuário atualiza só campos permitidos (não pode alterar is_admin, is_premium)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- is_admin e is_premium só podem ser alterados por service_role (functions SECURITY DEFINER)
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para rejeitar mudança em is_admin / is_premium via client
CREATE OR REPLACE FUNCTION reject_privilege_self_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.is_admin    IS DISTINCT FROM NEW.is_admin    THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF OLD.is_premium  IS DISTINCT FROM NEW.is_premium  THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_privilege_escalation ON profiles;
CREATE TRIGGER prevent_privilege_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION reject_privilege_self_escalation();

-- ============================================================
-- 4. RLS — favorites
-- ============================================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_own" ON favorites;
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. RLS — my_bar
-- ============================================================
ALTER TABLE my_bar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mybar_own" ON my_bar;
CREATE POLICY "mybar_own" ON my_bar
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. RLS — history
-- ============================================================
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_own"        ON history;
DROP POLICY IF EXISTS "history_ranking"    ON history;

-- Cada usuário vê e altera só o próprio histórico
CREATE POLICY "history_own" ON history
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Para o ranking: expor só user_id (sem drink_id, photo_url, etc.)
-- O client faz SELECT('user_id') então essa policy é suficiente;
-- a query de ranking não pede colunas sensíveis.

-- ============================================================
-- 7. RLS — drink_suggestions
-- ============================================================
ALTER TABLE drink_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suggestions_own" ON drink_suggestions;
CREATE POLICY "suggestions_own" ON drink_suggestions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. RLS — drinks_extra
-- ============================================================
ALTER TABLE drinks_extra ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drinks_extra_read_published" ON drinks_extra;
DROP POLICY IF EXISTS "drinks_extra_admin_all"      ON drinks_extra;

-- Qualquer usuário autenticado vê drinks publicados
CREATE POLICY "drinks_extra_read_published" ON drinks_extra
  FOR SELECT USING (published = TRUE);

-- Só admin pode inserir/atualizar/deletar/ver não publicados
CREATE POLICY "drinks_extra_admin_all" ON drinks_extra
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================================
-- 9. Proteger RPC set_user_premium — só admin pode chamar
-- ============================================================
CREATE OR REPLACE FUNCTION set_user_premium(target_email TEXT, premium BOOLEAN)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_id UUID;
BEGIN
  -- Verifica se quem chama é admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE email = target_email LIMIT 1;
  IF target_id IS NULL THEN RETURN 'user_not_found'; END IF;

  UPDATE profiles SET is_premium = premium WHERE id = target_id;
  RETURN 'ok';
END;
$$;

-- ============================================================
-- 10. Proteger RPCs de admin (get_admin_stats, get_user_list, get_recent_activity)
--     Adicionar verificação de admin no início de cada função
-- ============================================================

-- Exemplo para get_user_list (adapte as outras da mesma forma):
-- Adicione no início do corpo de cada function:
--   IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
--     RAISE EXCEPTION 'Forbidden: admin only';
--   END IF;

-- ============================================================
-- 11. Storage Policy — user-photos
--     (Rodar em Storage → Policies no dashboard, ou via SQL)
-- ============================================================

-- INSERT: usuário só pode enviar para sua própria pasta
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'user_photos_insert_own',
  'user-photos',
  'INSERT',
  '(storage.foldername(name))[1] = auth.uid()::text'
) ON CONFLICT DO NOTHING;

-- SELECT: usuário só vê as próprias fotos (remove acesso público se quiser privacidade)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'user_photos_select_own',
  'user-photos',
  'SELECT',
  '(storage.foldername(name))[1] = auth.uid()::text'
) ON CONFLICT DO NOTHING;

-- DELETE: usuário apaga só as próprias fotos
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'user_photos_delete_own',
  'user-photos',
  'DELETE',
  '(storage.foldername(name))[1] = auth.uid()::text'
) ON CONFLICT DO NOTHING;
