# Configuração de Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Configure no Vercel

Para que o deploy funcione corretamente, você PRECISA configurar as variáveis de ambiente no Vercel:

### Passo a Passo:

1. **Acesse o Dashboard do Vercel**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto

2. **Abra as Configurações**
   - Clique em **Settings** (Configurações)
   - No menu lateral, clique em **Environment Variables**

3. **Adicione as Variáveis**
   
   Adicione as seguintes variáveis com seus valores corretos:

   | Nome da Variável | Valor | Ambiente |
   |-----------------|-------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Sua URL do Supabase (ex: `https://xxxxx.supabase.co`) | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua chave anon do Supabase | Production, Preview, Development |

4. **Salvar e Re-deploy**
   - Clique em **Save**
   - Vá em **Deployments**
   - Clique nos três pontos do último deploy
   - Selecione **Redeploy**

## 🔍 Como Encontrar as Chaves do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ✅ Verificação

Após configurar as variáveis:
- O build não deve mais apresentar o erro `supabaseUrl is required`
- A aplicação funcionará corretamente em produção

## 📝 Nota

As variáveis com prefixo `NEXT_PUBLIC_` são expostas no navegador do cliente.
Nunca coloque chaves secretas (service_role key) nessas variáveis!
