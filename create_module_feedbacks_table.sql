-- Migração para criar tabela de feedbacks de módulos
-- Execute este script no Supabase SQL Editor

-- Criar tabela de feedbacks
CREATE TABLE IF NOT EXISTS module_feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir que cada usuário só pode dar um feedback por módulo
    UNIQUE(user_id, module_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_module_feedbacks_module_id ON module_feedbacks(module_id);
CREATE INDEX IF NOT EXISTS idx_module_feedbacks_user_id ON module_feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_module_feedbacks_created_at ON module_feedbacks(created_at DESC);

-- Habilitar RLS
ALTER TABLE module_feedbacks ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS

-- Usuários podem inserir seu próprio feedback
CREATE POLICY "Users can insert own feedback" 
ON module_feedbacks FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver seu próprio feedback
CREATE POLICY "Users can view own feedback" 
ON module_feedbacks FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio feedback
CREATE POLICY "Users can update own feedback" 
ON module_feedbacks FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Gestores podem ver todos os feedbacks (verificar se é gestor via profiles)
CREATE POLICY "Managers can view all feedbacks" 
ON module_feedbacks FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'gestor'
    )
);

-- Verificar que a tabela foi criada
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'module_feedbacks'
ORDER BY ordinal_position;
