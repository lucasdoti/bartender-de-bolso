-- ============================================================
-- PROTEÇÃO DAS RPCs DE ADMIN — Bartender de Bolso
-- Rodar no Supabase SQL Editor
-- ============================================================

-- 1. Função helper reutilizável
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;
END;
$$;

-- 2. get_admin_stats — com guard de admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM check_is_admin();

  RETURN json_build_object(
    'total_users',     (SELECT COUNT(*) FROM auth.users),
    'total_makes',     (SELECT COUNT(*) FROM history),
    'total_favorites', (SELECT COUNT(*) FROM favorites),
    'total_views',     (SELECT COUNT(*) FROM drink_views),

    'top_makes', (
      SELECT COALESCE(json_agg(r), '[]')
      FROM (
        SELECT drink_id, COUNT(*) AS count
        FROM history
        GROUP BY drink_id
        ORDER BY count DESC
        LIMIT 10
      ) r
    ),

    'top_favorites', (
      SELECT COALESCE(json_agg(r), '[]')
      FROM (
        SELECT drink_id, COUNT(*) AS count
        FROM favorites
        GROUP BY drink_id
        ORDER BY count DESC
        LIMIT 10
      ) r
    ),

    'top_views', (
      SELECT COALESCE(json_agg(r), '[]')
      FROM (
        SELECT drink_id, COUNT(*) AS count
        FROM drink_views
        GROUP BY drink_id
        ORDER BY count DESC
        LIMIT 10
      ) r
    ),

    'daily_activity', (
      SELECT COALESCE(json_agg(r), '[]')
      FROM (
        SELECT DATE(made_at) AS day, COUNT(*) AS count
        FROM history
        WHERE made_at >= NOW() - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day
      ) r
    ),

    'top_ingredients', (
      SELECT COALESCE(json_agg(r), '[]')
      FROM (
        SELECT ingredient_id, COUNT(*) AS count
        FROM my_bar
        GROUP BY ingredient_id
        ORDER BY count DESC
        LIMIT 10
      ) r
    )
  );
END;
$$;

-- 3. get_user_list — com guard de admin
CREATE OR REPLACE FUNCTION get_user_list()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  joined_at TIMESTAMPTZ,
  total_makes BIGINT,
  total_favorites BIGINT,
  last_make TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM check_is_admin();

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.created_at,
    COALESCE(m.cnt, 0),
    COALESCE(f.cnt, 0),
    m.last_make
  FROM auth.users u
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt, MAX(made_at) AS last_make
    FROM history GROUP BY user_id
  ) m ON m.user_id = u.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt
    FROM favorites GROUP BY user_id
  ) f ON f.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- 4. get_recent_activity — com guard de admin
CREATE OR REPLACE FUNCTION get_recent_activity(limit_n INTEGER DEFAULT 30)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  drink_id INTEGER,
  made_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM check_is_admin();

  RETURN QUERY
  SELECT h.user_id, u.email, h.drink_id, h.made_at
  FROM history h
  JOIN auth.users u ON u.id = h.user_id
  ORDER BY h.made_at DESC
  LIMIT limit_n;
END;
$$;
