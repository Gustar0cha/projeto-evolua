# 🔧 Guia: Adicionar Coluna cover_image no Supabase

## ❌ Problema Identificado
A coluna `cover_image` não existe na tabela `modules` do banco de dados.

**Erro:** `Could not find the 'cover_image' column of 'modules' in the schema cache`

## ✅ Solução: Executar Migration SQL

### Passo 1: Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **Evolua**

### Passo 2: Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New query** (ou use uma query existente)

### Passo 3: Executar a Migration
1. Copie o conteúdo do arquivo `add_cover_image_column.sql`
2. Cole no editor SQL do Supabase
3. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 4: Verificar a Execução
Você deve ver uma mensagem de sucesso. Para confirmar que a coluna foi criada:

```sql
-- Execute esta query para verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'modules' 
AND column_name = 'cover_image';
```

Deve retornar:
```
column_name  | data_type
-------------|----------
cover_image  | text
```

### Passo 5: Testar o Upload
1. Volte para http://localhost:3000/modules
2. Edite um módulo
3. Faça upload de uma imagem
4. Clique em "Salvar Módulo"
5. ✅ Agora deve funcionar!

## 📋 SQL da Migration

```sql
-- Add cover_image column to modules table
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Add comment to document the column
COMMENT ON COLUMN modules.cover_image IS 'Base64 encoded cover image for the module (optimized to ~500KB)';
```

## 🎯 O que esta migration faz?

- ✅ Adiciona a coluna `cover_image` do tipo `TEXT` na tabela `modules`
- ✅ Usa `IF NOT EXISTS` para evitar erros se a coluna já existir
- ✅ Adiciona um comentário documentando o propósito da coluna
- ✅ Permite armazenar strings Base64 de até ~1GB (limite do tipo TEXT no PostgreSQL)

## ⚠️ Observações Importantes

1. **Tipo TEXT**: Escolhemos `TEXT` em vez de `VARCHAR` porque:
   - Não tem limite de tamanho (perfeito para Base64)
   - Melhor performance para strings grandes
   - Padrão do PostgreSQL para textos longos

2. **Valores NULL**: A coluna aceita valores NULL por padrão, então módulos existentes não terão problemas

3. **Otimização**: As imagens são automaticamente otimizadas para ~500KB antes de serem salvas

## 🔄 Após Executar a Migration

Teste o fluxo completo:
1. Upload de imagem (até 5MB)
2. Otimização automática (redimensionamento + compressão)
3. Salvamento no banco de dados
4. Visualização no card de treinamento

---

**Criado em:** 2025-12-13
**Versão:** 1.0
