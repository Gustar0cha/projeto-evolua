# 🚨 Guia Rápido de Troubleshooting

## Você viu este erro? "Erro ao carregar usuários"

### ✅ SOLUÇÃO RÁPIDA - FAÇA AGORA:

1. **Abra o Supabase Dashboard**: https://app.supabase.com
2. **Vá em SQL Editor** (menu lateral)
3. **Execute o diagnóstico**:
   - Copie TODO o conteúdo de `diagnostico_rapido.sql`
   - Cole no SQL Editor
   - Clique em **RUN**
   - **LEIA OS RESULTADOS** ⬇️

---

## 📊 Como Interpretar os Resultados:

### Cenário 1: "Coluna email: ❌ NÃO EXISTE"

**O QUE FAZER:**
1. Execute `migracao_simplificada.sql` (arquivo mais robusto)
2. Recarregue a página de usuários
3. Deve funcionar! ✅

---

### Cenário 2: "Trigger on_auth_user_created: ❌ NÃO EXISTE"

**O QUE FAZER:**
1. Execute `migracao_simplificada.sql`
2. Agora novos usuários terão profiles criados automaticamente ✅

---

### Cenário 3: Erro "permission denied for table profiles"

**O QUE FAZER:**
1. Execute `migracao_simplificada.sql`
2. Isso vai configurar as políticas RLS corretamente ✅

---

### Cenário 4: Tudo mostra ✅ mas ainda não funciona

**O QUE FAZER:**
1. Verifique se você está logado como **GESTOR** (não colaborador)
2. Limpe o cache do navegador:
   - Chrome/Edge: Ctrl+Shift+Del
   - Marque "Cookies" e "Dados em cache"
   - Limpar
3. Faça logout e login novamente
4. Tente novamente

---

## 🔧 Scripts Disponíveis:

### 1. `diagnostico_rapido.sql` ⭐ (RODE PRIMEIRO!)
Execute para **identificar** qual é o problema exato.

### 2. `migracao_simplificada.sql` ⭐ (RODE SE DIAGNÓSTICO FALHAR)
Versão mais robusta da migração com melhor tratamento de erros.

### 3. `fix_profiles_and_auth.sql`
Versão completa original (se a simplificada não funcionar).

---

## 📝 Passo a Passo Detalhado:

### PASSO 1: Diagnóstico
```
1. Abra Supabase Dashboard
2. SQL Editor
3. Cole: diagnostico_rapido.sql
4. RUN
5. Leia os resultados
```

### PASSO 2: Aplicar Migração
```
1. Mesmo SQL Editor
2. Cole: migracao_simplificada.sql
3. RUN
4. Deve mostrar: "✅ TUDO CONFIGURADO!"
```

### PASSO 3: Teste na Aplicação
```
1. Volte para a aplicação
2. Vá em Usuários
3. Clique em "Criar Usuário"
4. Preencha os dados
5. Deve funcionar sem erros!
```

---

## 🆘 Ainda não funcionou?

### Verifique no Console do Navegador (F12):

1. Abra a página de Usuários
2. Pressione **F12**
3. Aba **Console**
4. Procure por "Erro detalhado ao buscar profiles:"
5. **Me envie a mensagem completa com todos os detalhes**

Exemplo do que procurar:
```
Erro detalhado ao buscar profiles: {
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```

---

## ✅ Como Saber se Está Tudo OK:

### No SQL Editor (após executar diagnóstico):

- ✅ "Tabela profiles: ✅ EXISTE"
- ✅ "Coluna email: ✅ EXISTE"
- ✅ "Trigger: ✅ EXISTE"
- ✅ "Políticas RLS: 6 políticas encontradas" (ou mais)
- ✅ Query 9 retorna suas profiles sem erro

### Na Aplicação:

- ✅ Página de Usuários carrega sem erros
- ✅ Mostra lista de usuários (pode estar vazia se não criou nenhum ainda)
- ✅ Modal "Criar Usuário" abre corretamente
- ✅ Consegue criar usuário sem erros
- ✅ Após criar, usuário aparece na lista COM email

---

## 💡 Dicas Importantes:

1. **Execute TODO o arquivo SQL**, não apenas partes
2. Use **SQL Editor do Supabase**, não psql ou outro cliente
3. Se der erro em alguma linha, continue! Muitas linhas são DROP IF EXISTS
4. A ordem importa: sempre rode `diagnostico_rapido.sql` ANTES
5. Limpe o cache do navegador se mudanças não aparecerem

---

## 📞 Checklist Final:

- [ ] Executei `diagnostico_rapido.sql`
- [ ] Li todos os resultados
- [ ] Executei `migracao_simplificada.sql`
- [ ] Vi a mensagem "✅ TUDO CONFIGURADO!"
- [ ] Recarreguei a página de Usuários
- [ ] Limpei o cache do navegador
- [ ] Fiz logout e login novamente
- [ ] Testei criar um usuário

Se TODOS os itens acima estão marcados e AINDA não funciona:
**Me envie o console completo (F12) e os resultados do diagnóstico!**

---

**Última atualização**: 14/12/2025 23:47
