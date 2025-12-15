-- ============================================
-- SOLUÇÃO SIMPLES: Redefinir Senha Via SQL
-- Execute este comando direto no SQL Editor
-- ============================================

-- Passo 1: Liste os usuários para pegar o email
SELECT id, email, raw_user_meta_data->>'name' as nome
FROM auth.users
ORDER BY created_at DESC;

-- Passo 2: SUBSTITUA o email abaixo e execute
-- Coloque o email do usuário que quer resetar a senha

-- IMPORTANTE: Mude 'usuario@exemplo.com' e 'SenhaNova123'
UPDATE auth.users
SET 
  encrypted_password = crypt('SenhaNova123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'usuario@exemplo.com';

-- Verificar se atualizou
SELECT email, updated_at 
FROM auth.users 
WHERE email = 'usuario@exemplo.com';

-- ============================================
-- ALTERNATIVA: Se quiser usar o ID do usuário
-- ============================================

-- Substitua 'ID-AQUI' e 'NovaSenha123'
/*
UPDATE auth.users
SET 
  encrypted_password = crypt('NovaSenha123', gen_salt('bf')),
  updated_at = now()
WHERE id = 'ID-AQUI';
*/
