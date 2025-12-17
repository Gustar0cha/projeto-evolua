-- Migração para adicionar tipo 'pdf' na tabela module_sections
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar se a constraint existe e removê-la
ALTER TABLE module_sections 
DROP CONSTRAINT IF EXISTS module_sections_type_check;

-- Agora vamos adicionar a nova constraint incluindo 'pdf'
ALTER TABLE module_sections 
ADD CONSTRAINT module_sections_type_check 
CHECK (type IN ('video', 'quiz', 'text', 'pdf'));

-- Verificar que a alteração foi aplicada
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'module_sections'::regclass 
AND contype = 'c';
