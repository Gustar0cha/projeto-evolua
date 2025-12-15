-- ============================================
-- Migração Simplificada - Versão Mínima
-- Se a migração completa deu erro, tente esta!
-- ============================================

-- PASSO 1: Adicionar coluna email (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Coluna email adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna email já existe!';
  END IF;
END $$;

-- PASSO 2: Sincronizar emails existentes
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- PASSO 3: Criar função para o trigger (DROP se existir)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'colaborador'),
    true
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o profile já existe, atualizar o email
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falha a criação do usuário
    RAISE WARNING 'Erro ao criar profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- PASSO 4: Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 5: Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Limpar políticas antigas
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Gestores can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Gestores can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation via trigger" ON profiles;
DROP POLICY IF EXISTS "Gestores can delete profiles" ON profiles;

-- PASSO 7: Criar políticas RLS (VERSÃO SIMPLIFICADA)

-- Permitir que todos vejam seus próprios profiles
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Permitir gestores vejam todos os profiles
CREATE POLICY "select_all_profiles_for_managers"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- Permitir atualização do próprio profile
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permitir gestores atualizem qualquer profile
CREATE POLICY "update_all_profiles_for_managers"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- IMPORTANTE: Permitir inserção para o trigger
CREATE POLICY "insert_profile_via_trigger"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Permitir gestores deletem profiles
CREATE POLICY "delete_profiles_for_managers"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- PASSO 8: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- TESTE RÁPIDO
-- ============================================

-- Verificar se funcionou
SELECT 
  'Status: ' || 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email')
    AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles')
    THEN '✅ TUDO CONFIGURADO!'
    ELSE '❌ ALGUM PROBLEMA - Verifique as mensagens acima'
  END;

-- Mostrar profiles existentes
SELECT id, name, email, role, active FROM profiles ORDER BY created_at DESC LIMIT 10;
