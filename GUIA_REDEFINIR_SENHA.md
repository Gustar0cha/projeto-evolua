# 🔐 Guia: Redefinir Senha de Usuário

## ⚠️ **Problema Identificado**

A função `supabase.auth.admin.updateUserById()` requer a **service_role key**, que não deve estar exposta no cliente por segurança.

Por isso, a função de redefinir senha na interface vai dar erro de permissão.

---

## ✅ **SOLUÇÕES DISPONÍVEIS**

### **Solução 1: SQL Direto (Temporário) ⭐ MAIS RÁPIDO**

Use o arquivo: `reset_senha_simples.sql`

**Passo a passo:**
1. Abra Supabase SQL Editor
2. Execute a primeira query para listar usuários
3. Copie o email do usuário que quer resetar
4. Na segunda query, substitua:
   - `usuario@exemplo.com` → email do usuário
   - `SenhaNova123` → nova senha
5. Execute
6. Pronto! ✅

**Exemplo:**
```sql
UPDATE auth.users
SET 
  encrypted_password = crypt('MinhaNovaSeñha123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'joao@teste.com';
```

---

### **Solução 2: Configurar Service Role (Produção)**

Para fazer funcionar na interface, você precisa:

#### **Opção A: Criar Edge Function**

1. No Supabase Dashboard → Edge Functions
2. Criar nova function chamada `reset-user-password`
3. Código da function:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId, newPassword } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

4. No código TypeScript, chamar:
```tsx
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/reset-user-password`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ userId, newPassword })
  }
);
```

#### **Opção B: Database Function (RPC)**

1. No Supabase SQL Editor, criar function:

```sql
CREATE OR REPLACE FUNCTION reset_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário que está chamando é gestor
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'gestor'
  ) THEN
    RAISE EXCEPTION 'Apenas gestores podem redefinir senhas';
  END IF;

  -- Atualizar senha
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
END;
$$;
```

2. No código TypeScript:
```tsx
const { error } = await supabase.rpc('reset_user_password', {
  user_id: resetPasswordUser.id,
  new_password: newPassword
});
```

---

### **Solução 3: Remover Funcionalidade (Alternativa)**

Se não quiser configurar service role ou edge function, você pode:

1. **Remover** o botão "Redefinir Senha" da interface
2. **Instruir usuários** a usar "Esqueci minha senha" no login
3. **Gestores** usam o SQL direto quando necessário

---

## 🎯 **Recomendação**

**Para agora (desenvolvimento):**
- Use **Solução 1** (SQL direto)
- Simples e funciona imediatamente

**Para produção:**
- Use **Solução 2B** (Database Function/RPC)
- Mais seguro que Edge Function
- Não expõe service_role key  
- Verifica se usuário é gestor

---

## 📋 **Como Implementar Solução 2B (RPC)**

### Passo 1: Criar a Function no Supabase

Execute no SQL Editor:
```sql
CREATE OR REPLACE FUNCTION reset_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS json
LANGUAGE  plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é gestor
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'gestor'
  ) THEN
    RETURN json_build_object('error', 'Apenas gestores podem redefinir senhas');
  END IF;

  -- Validar senha
  IF length(new_password) < 6 THEN
    RETURN json_build_object('error', 'Senha deve ter pelo menos 6 caracteres');
  END IF;

  -- Atualizar senha
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;
```

### Passo 2: Atualizar o Código TypeScript

Substitua na função `handleResetPassword`:

```tsx
try {
  const { data, error } = await supabase.rpc('reset_user_password', {
    user_id: resetPasswordUser.id,
    new_password: newPassword
  });

  if (error) throw error;
  
  // Verificar se a function retornou erro
  if (data?.error) {
    throw new Error(data.error);
  }

  toast.success('Senha redefinida com sucesso!');
  // ... resto do código
}
```

---

## ✅ **Qual Solução Escolher?**

| Solução | Pros | Contras | Quando Usar |
|---------|------|---------|-------------|
| **SQL Direto** | ✅ Rápido<br>✅ Simples | ❌ Manual<br>❌ Não é UI | Desenvolvimento |
| **Edge Function** | ✅ Flexível<br>✅ Isolado | ❌ Setup complexo<br>❌ Custo extra | Apps grandes |
| **RPC Function** | ✅ Seguro<br>✅ Integrado<br>✅ Valida permissão | ❌ Requer SQL | ⭐ **RECOMENDADO** |

---

**Por agora, use o `reset_senha_simples.sql` e depois implementamos a Solução 2B (RPC)!** 🚀
