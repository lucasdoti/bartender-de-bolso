-- ============================================================
-- RLS para a tabela drink_views — Bartender de Bolso
-- Rodar no Supabase SQL Editor
-- ============================================================

-- Garante que a tabela existe com a estrutura correta
CREATE TABLE IF NOT EXISTS drink_views (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drink_id   INTEGER     NOT NULL,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS drink_views_user_id_idx  ON drink_views(user_id);
CREATE INDEX IF NOT EXISTS drink_views_drink_id_idx ON drink_views(drink_id);
CREATE INDEX IF NOT EXISTS drink_views_viewed_at_idx ON drink_views(viewed_at DESC);

-- Habilita RLS
ALTER TABLE drink_views ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado pode registrar a própria visualização
CREATE POLICY "users_insert_own_view"
  ON drink_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuário pode ver as próprias visualizações (histórico pessoal)
CREATE POLICY "users_select_own_views"
  ON drink_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ninguém pode atualizar registros de visualização (imutável por design)
-- Ninguém pode deletar via client — limpeza só via service_role (RPCs admin)
-- (sem políticas UPDATE/DELETE = bloqueado para usuários)

-- Garante que service_role (usado pelas RPCs SECURITY DEFINER) tem acesso total
GRANT SELECT, INSERT ON drink_views TO authenticated;
GRANT ALL ON drink_views TO service_role;
-- Sequências da tabela (cobre qualquer nome de sequence gerada pelo BIGSERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
