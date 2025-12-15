-- ============================================
-- Script de Diagnóstico Rápido
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar se a tabela profiles existe
SELECT 
  'Tabela profiles: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅ EXISTE' 
    ELSE '❌ NÃO EXISTE' 
  END as status;

-- 2. Verificar colunas da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Verificar se a coluna email existe
SELECT 
  'Coluna email: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) 
    THEN '✅ EXISTE' 
    ELSE '❌ NÃO EXISTE - EXECUTE A MIGRAÇÃO!' 
  END as status;

-- 4. Verificar se o trigger existe
SELECT 
  'Trigger on_auth_user_created: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) 
    THEN '✅ EXISTE' 
    ELSE '❌ NÃO EXISTE - EXECUTE A MIGRAÇÃO!' 
  END as status;

-- 5. Contar usuários na tabela profiles
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(*) FILTER (WHERE active = true) as usuarios_ativos,
  COUNT(*) FILTER (WHERE active = false) as usuarios_inativos
FROM profiles;

-- 6. Verificar políticas RLS
SELECT 
  'Políticas RLS: ' || COUNT(*)::text || ' políticas encontradas'
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Listar todas as políticas RLS da tabela profiles
SELECT 
  policyname as nome_politica,
  cmd as comando,
  permissive as permissiva,
  roles as roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 8. Verificar se RLS está habilitado
SELECT 
  'RLS na tabela profiles: ' || 
  CASE WHEN relrowsecurity 
    THEN '✅ HABILITADO' 
    ELSE '❌ DESABILITADO' 
  END as status
FROM pg_class 
WHERE relname = 'profiles';

-- 9. Tentar buscar profiles ativos (o que a aplicação faz)
-- Se der erro aqui, o problema é com RLS ou estrutura da tabela
SELECT 
  id,
  name,
  email,
  role,
  active,
  created_at
FROM profiles 
WHERE active = true 
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- ============================================
-- 
-- Se "Coluna email: ❌ NÃO EXISTE":
--   → Execute fix_profiles_and_auth.sql COMPLETO
--
-- Se "Trigger: ❌ NÃO EXISTE":
--   → Execute fix_profiles_and_auth.sql COMPLETO
--
-- Se a query 9 der erro "permission denied":
--   → Execute fix_profiles_and_auth.sql para configurar RLS
--
-- Se tudo der ✅ mas ainda não funciona na app:
--   → Verifique se está logado como gestor
--   → Limpe o cache do navegador (Ctrl+Shift+Del)
--   → Recarregue a página
-- ============================================
