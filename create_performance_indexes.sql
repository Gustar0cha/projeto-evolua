-- =============================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- Execute no Supabase SQL Editor
-- =============================================

-- =============================================
-- ÍNDICES CRÍTICOS (Prioridade Alta)
-- =============================================

-- Índices para a tabela user_quiz_answers (muito consultada)
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_id 
ON user_quiz_answers(user_id);

CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_module_id 
ON user_quiz_answers(module_id);

-- ✅ ÍNDICE COMPOSTO CRÍTICO: Para buscar respostas por usuário e módulo
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_module 
ON user_quiz_answers(user_id, module_id);

-- Índices para user_module_progress
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id 
ON user_module_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id 
ON user_module_progress(module_id);

CREATE INDEX IF NOT EXISTS idx_user_module_progress_status 
ON user_module_progress(status);

-- ✅ ÍNDICE COMPOSTO CRÍTICO: Para buscar progresso de um usuário
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_status 
ON user_module_progress(user_id, status);

-- =============================================
-- ÍNDICES PARA module_sections e quiz_questions
-- =============================================

-- Índices para module_sections (busca frequente por module_id)
CREATE INDEX IF NOT EXISTS idx_module_sections_module_order 
ON module_sections(module_id, order_index);

-- Índices para quiz_questions
-- ✅ ÍNDICE COMPOSTO CRÍTICO: Para buscar questões de múltiplas seções com IN()
CREATE INDEX IF NOT EXISTS idx_quiz_questions_section_order 
ON quiz_questions(section_id, order_index);

-- =============================================
-- ÍNDICES PARA modules e profiles
-- =============================================

-- Índices para modules
CREATE INDEX IF NOT EXISTS idx_modules_status 
ON modules(status);

CREATE INDEX IF NOT EXISTS idx_modules_status_created 
ON modules(status, created_at DESC);

-- Índices para profiles
-- ✅ ÍNDICE COMPOSTO CRÍTICO: Para buscar colaboradores ativos
CREATE INDEX IF NOT EXISTS idx_profiles_role_active 
ON profiles(role, active);

-- =============================================
-- ÍNDICES PARA module_feedbacks
-- =============================================

CREATE INDEX IF NOT EXISTS idx_module_feedbacks_created_at 
ON module_feedbacks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_feedbacks_module_rating 
ON module_feedbacks(module_id, rating);

-- =============================================
-- VERIFICAÇÃO
-- =============================================

-- Verificar índices criados
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
