# 🔧 Correção do Sistema de Autenticação e Profiles

## Problema Identificado

Os erros que você estava enfrentando eram causados por:

1. **Falta da coluna `email`** na tabela `profiles`
2. **Ausência de trigger automático** para criar profile quando um usuário se registra
3. **Políticas RLS inadequadas** que não permitiam a criação/atualização de profiles

## ✅ Solução Implementada

### 1. Arquivo de Migração SQL

Foi criado o arquivo `fix_profiles_and_auth.sql` que:

- ✅ Adiciona a coluna `email` na tabela `profiles`
- ✅ Cria um trigger automático que cria o profile quando um usuário é criado no auth
- ✅ Configura políticas RLS corretas para permitir operações necessárias
- ✅ Sincroniza emails existentes para profiles já criados

### 2. Código Simplificado

O código de criação de usuários foi simplificado porque agora o trigger do banco de dados faz o trabalho automaticamente.

---

## 📋 INSTRUÇÕES PARA APLICAR A CORREÇÃO

### Passo 1: Acessar o Supabase SQL Editor

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query** para criar uma nova query

### Passo 2: Executar a Migração

1. Abra o arquivo `fix_profiles_and_auth.sql` neste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verificar se Funcionou

Execute estas queries no SQL Editor para verificar:

```sql
-- 1. Verificar se a coluna email existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'email';

-- 2. Verificar se o trigger existe
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar políticas RLS
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Se todos retornarem resultados, a migração foi aplicada com sucesso! ✅

---

## 🧪 Testando o Sistema

### Teste 1: Criar Novo Usuário

1. Acesse a página de **Usuários** no sistema
2. Clique em **Criar Usuário**
3. Preencha os dados:
   - Nome: Teste Usuario
   - Email: teste@example.com
   - Tipo: Colaborador
   - Senha: 123456
4. Clique em **Criar Usuário**

✅ **Esperado**: Usuário criado com sucesso, sem erros no console

### Teste 2: Login com Novo Usuário

1. Faça logout
2. Faça login com o usuário criado
3. Verifique se é redirecionado corretamente

✅ **Esperado**: Login bem-sucedido, sem erros de "profile não encontrado"

### Teste 3: Verificar Email na Lista

1. Faça login como gestor
2. Acesse **Usuários**
3. Verifique se o email do usuário aparece na tabela

✅ **Esperado**: Email visível na coluna Email

---

## 🔍 O Que Foi Mudado no Código

### Antes (Problemático):
```tsx
// Tentava atualizar manualmente o email após criar usuário
const { error: updateError } = await supabase
  .from('profiles')
  .update({ email: newUser.email })
  .eq('id', data.user.id);
```

❌ **Problema**: Falhava por falta de permissão RLS

### Depois (Correto):
```tsx
// O trigger do banco de dados cria o profile automaticamente
const { data, error } = await supabase.auth.signUp({
  email: newUser.email,
  password: newUser.password,
  options: {
    data: { name: newUser.name, role: newUser.role }
  }
});
```

✅ **Solução**: Trigger cria o profile com email automaticamente

---

## 🚨 Problemas Comuns e Soluções

### Erro: "permission denied for table profiles"

**Solução**: Verifique se executou toda a migração SQL, especialmente a parte das políticas RLS.

### Erro: "duplicate key value violates unique constraint"

**Solução**: O usuário já existe. Use um email diferente ou delete o usuário existente primeiro.

### Emails não aparecem na lista

**Solução**: Execute a query de sincronização:
```sql
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
```

---

## 📊 Estrutura Final da Tabela Profiles

```
profiles
├── id (uuid, primary key)
├── name (text)
├── email (text) ← NOVO
├── role (text: 'gestor' | 'colaborador')
├── active (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## ✅ Checklist de Verificação

- [ ] Executei a migração SQL completa no Supabase
- [ ] Verifiquei que a coluna `email` existe na tabela profiles
- [ ] Verifiquei que o trigger `on_auth_user_created` existe
- [ ] Testei criar um novo usuário - funcionou sem erros
- [ ] Testei fazer login com o novo usuário - funcionou
- [ ] Os emails aparecem na lista de usuários

---

## 🆘 Precisa de Ajuda?

Se algum passo não funcionar:

1. Verifique os logs do console do navegador (F12)
2. Verifique se está logado como **Gestor** no sistema
3. Confirme que executou **TODO** o arquivo SQL, não apenas partes dele
4. Me avise qual erro específico está aparecendo!

---

**Data da Correção**: 14/12/2025  
**Arquivos Modificados**:
- `fix_profiles_and_auth.sql` (NOVO)
- `src/app/(admin)/users/page.tsx` (ATUALIZADO)
- `src/lib/supabase.ts` (ATUALIZADO - tipo Profile)
