-- ============================================
-- Script Alternativo: Redefinir Senha de Usuário
-- Use se a interface não funcionar
-- ============================================

-- IMPORTANTE: Substitua os valores abaixo antes de executar!

-- Exemplo: Redefinir senha do usuário com email específico
-- Substitua 'usuario@exemplo.com' e 'nova_senha_aqui'

DO $$
DECLARE
  user_email TEXT := 'usuario@exemplo.com';  -- ⬅️ MUDE AQUI
  nova_senha TEXT := 'nova_senha_123';        -- ⬅️ MUDE AQUI
  user_id UUID;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;

  -- Redefinir a senha
  -- Nota: Isso requer permissões de service_role
  UPDATE auth.users
  SET 
    encrypted_password = crypt(nova_senha, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;

  RAISE NOTICE 'Senha do usuário % redefinida com sucesso!', user_email;
END $$;

-- ============================================
-- Ou use este método mais simples (se você tiver o ID do usuário):
-- ============================================

-- Listar usuários para pegar o ID
SELECT id, email, raw_user_meta_data->>'name' as nome
FROM auth.users
ORDER BY created_at DESC;

-- Copie o ID do usuário acima e use aqui:
-- Substitua 'ID-DO-USUARIO-AQUI' e 'nova_senha'

/*
UPDATE auth.users
SET 
  encrypted_password = crypt('nova_senha', gen_salt('bf')),
  updated_at = NOW()  
WHERE id = 'ID-DO-USUARIO-AQUI';
*/

-- ============================================
-- Verificação
-- ============================================

-- Ver quando a senha foi atualizada pela última vez
SELECT 
  email,
  raw_user_meta_data->>'name' as nome,
  updated_at,
  created_at
FROM auth.users
ORDER BY updated_at DESC
LIMIT 5;
