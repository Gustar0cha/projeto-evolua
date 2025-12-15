-- ============================================
-- Verificar Usuário Logado e Permissões
-- Execute para ver quem você está logado
-- ============================================

-- 1. Verificar qual usuário está autenticado AGORA
SELECT 
  auth.uid() as meu_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NÃO AUTENTICADO'
    ELSE '✅ AUTENTICADO'
  END as status_autenticacao;

-- 2. Verificar seu profile e role
SELECT 
  id,
  name,
  email,
  role,
  active,
  CASE 
    WHEN id = auth.uid() THEN '👤 ESTE É VOCÊ!'
    ELSE ''
  END as voce
FROM profiles
WHERE id = auth.uid();

-- 3. Testar se você consegue ver profiles (simulando o que a app faz)
SELECT 
  'Teste de SELECT em profiles:' as teste,
  COUNT(*) as profiles_que_consigo_ver
FROM profiles
WHERE active = true;

-- 4. Verificar se você é gestor
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gestor')
    THEN '✅ VOCÊ É GESTOR - Pode ver todos os usuários'
    ELSE '❌ VOCÊ É COLABORADOR - Só pode ver seu próprio profile'
  END as status;

-- 5. Listar profiles que você TEM permissão para ver
SELECT 
  id,
  name,
  email,
  role,
  active
FROM profiles
WHERE active = true
ORDER BY created_at DESC;

-- ============================================
-- INTERPRETAÇÃO:
-- ============================================
-- Se "❌ NÃO AUTENTICADO":
--   → Faça login na aplicação primeiro
--
-- Se "❌ VOCÊ É COLABORADOR":
--   → Você não consegue acessar a página de Usuários
--   → Precisa usar uma conta GESTOR
--   → Use: admin@teste.com
--
-- Se query 5 der erro ou retornar 0 linhas:
--   → Problema com políticas RLS
--   → Execute: fix_rls_policies.sql (criar abaixo)
-- ============================================
