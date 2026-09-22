-- ============================================================
-- PROTEÇÃO DAS RPCs DE ADMIN
-- Abra cada função no Supabase (Database → Functions → editar)
-- e adicione o bloco de verificação no INÍCIO do body.
-- OU rode este script diretamente — ele recria as funções
-- com o guard de admin no começo.
-- ============================================================
-- IMPORTANTE: copie o body atual de cada função antes de rodar,
-- e substitua o comentário "-- corpo existente da função --"
-- pelo conteúdo real. O script abaixo mostra o PADRÃO a seguir.
-- ============================================================

-- PADRÃO: adicionar no início de cada função admin:
-- IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
--   RAISE EXCEPTION 'Forbidden: admin only';
-- END IF;

-- ============================================================
-- Alternativa mais simples: criar uma função helper e chamar
-- ============================================================

CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;
END;
$$;

-- Depois, no início de cada RPC de admin, adicione apenas:
-- PERFORM check_is_admin();

-- ============================================================
-- EXEMPLO: como ficaria get_admin_stats com o guard
-- (adapte com o body real que você tem no Supabase)
-- ============================================================
-- CREATE OR REPLACE FUNCTION get_admin_stats()
-- RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   PERFORM check_is_admin();  -- << ADICIONAR ESTA LINHA
--
--   -- ... restante do corpo original da função ...
-- END;
-- $$;

-- ============================================================
-- Faça o mesmo para:
--   get_user_list()
--   get_recent_activity(limit_n INT)
-- ============================================================
