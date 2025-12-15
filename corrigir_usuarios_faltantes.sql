-- ============================================
-- Corrigir Usuários Sem Profile
-- Execute DEPOIS de rodar verificar_todos_usuarios.sql
-- ============================================

-- SOLUÇÃO 1: Criar profiles para usuários que não têm
-- (Execute só se a query 3 do script anterior retornou usuários)

INSERT INTO profiles (id, name, email, role, active)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'colaborador') as role,
  true as active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verificar quantos foram criados
SELECT 
  'Profiles criados: ' || COUNT(*) as resultado
FROM profiles
WHERE id IN (
  SELECT u.id FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
);

-- SOLUÇÃO 2: Ativar todos os usuários inativos
-- (Execute se quer mostrar TODOS na lista)

UPDATE profiles
SET active = true
WHERE active = false;

-- Verificar quantos foram ativados
SELECT 
  'Usuários ativados: ' || COUNT(*) as resultado
FROM profiles
WHERE active = true;

-- SOLUÇÃO 3: Atualizar emails que estão NULL
-- (Sincronizar email do auth.users para profiles)

UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id 
AND (p.email IS NULL OR p.email = '');

-- Verificar quantos foram atualizados
SELECT 
  'Emails atualizados: ' || COUNT(*) as resultado
FROM profiles
WHERE email IS NOT NULL AND email != '';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Ver TODOS os profiles agora (deve mostrar todos!)
SELECT 
  id,
  name,
  email,
  role,
  active,
  created_at
FROM profiles
WHERE active = true
ORDER BY created_at DESC;

-- Contar total
SELECT 
  COUNT(*) as total_usuarios_ativos
FROM profiles
WHERE active = true;

-- ============================================
-- APÓS EXECUTAR:
-- 1. Recarregue a página de Usuários na aplicação
-- 2. Todos os usuários devem aparecer agora!
-- ============================================
