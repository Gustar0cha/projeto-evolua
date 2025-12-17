-- ============================================
-- Verificar Usuários Criados
-- Execute para ver TODOS os usuários
-- ============================================

-- 1. Ver TODOS os usuários no auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email NÃO confirmado'
    ELSE '✅ Email confirmado'
  END as status_confirmacao
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver TODOS os profiles (ativos E inativos)
SELECT 
  id,
  name,
  email,
  role,
  active,
  created_at,
  CASE 
    WHEN active = true THEN '✅ ATIVO'
    ELSE '❌ INATIVO'
  END as status
FROM profiles
ORDER BY created_at DESC;

-- 3. Ver usuários que EXISTEM no auth mas NÃO TEM profile
SELECT 
  u.id,
  u.email,
  u.created_at,
  'SEM PROFILE!' as problema
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Contar total de usuários x profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE active = true) as profiles_ativos,
  (SELECT COUNT(*) FROM profiles WHERE active = false) as profiles_inativos;

-- 5. Ver detalhes completos (auth + profile)


-- ============================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- ============================================
--
-- Query 3 retorna linhas:
--   → Usuários sem profile - trigger não funcionou
--   → Solução: Criar profiles manualmente (próximo script)
--
-- Query 2 mostra usuários com active = false:
--   → Usuários inativos não aparecem na lista
--   → Solução: Ativar os usuários
--
-- Query 1 mostra email_confirmed_at = NULL:
--   → Email não confirmado (modo dev ignora isso)
--   → Não é problema no dev
-- ============================================
