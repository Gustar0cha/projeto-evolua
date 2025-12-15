-- ============================================
-- Migration: Fix Profiles Table and Auth
-- Execute this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Add email column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'colaborador'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Gestores can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Gestores can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Gestores can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Gestores can delete profiles" ON profiles;

-- 6. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create comprehensive RLS policies

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Gestores can view all profiles
CREATE POLICY "Gestores can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (role = (SELECT role FROM profiles WHERE id = auth.uid()))
  );

-- Policy: Gestores can update all profiles
CREATE POLICY "Gestores can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- Policy: Allow trigger to insert profiles (SECURITY DEFINER)
CREATE POLICY "Allow profile creation via trigger"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Policy: Gestores can delete profiles
CREATE POLICY "Gestores can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- 8. Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 9. Update existing profiles with emails from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 10. Add comment to document the email column
COMMENT ON COLUMN profiles.email IS 'User email address synchronized from auth.users';

-- ============================================
-- Verification Queries (Run these to check)
-- ============================================

-- Check profiles structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'profiles';

-- Check trigger exists
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';
