# Deploy passo a passo (Supabase + Vercel)

Não existe back-end separado para hospedar. O Next.js roda na Vercel (páginas + funções de servidor) e o Supabase faz banco, login e segurança. Os dois têm plano gratuito para começar.

```
Navegador ──► Vercel (Next.js: páginas, proxy de login, server actions do admin)
                 │
                 └──► Supabase (Auth JWT + Postgres com RLS)
```

Tempo estimado: 20 a 30 minutos.

---

## 1. Supabase

1. Crie um projeto em <https://supabase.com> (região **South America (São Paulo)**, a mesma da Vercel configurada no `vercel.json`).
2. **SQL Editor › New query**: cole todo o arquivo [`supabase/schema.sql`](../supabase/schema.sql) e clique em **Run**. Deve terminar com "Success. No rows returned".
3. **Project Settings › API Keys**: copie
   - a chave **publishable** (`sb_publishable_...`) ou, na aba *Legacy*, a **anon** → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
   - a chave **secret** (`sb_secret_...`) ou a **service_role** → vai em `SUPABASE_SERVICE_ROLE_KEY` (nunca compartilhe, nunca coloque no front).
4. **Project Settings › Data API**: copie a **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.

### 1.1 Autenticação

Em **Authentication › URL Configuration**:

- **Site URL**: o domínio final (ex.: `https://app.seudominio.com.br`). Enquanto não tiver domínio, use o `https://SEU-PROJETO.vercel.app`.
- **Redirect URLs**: adicione `https://SEU-DOMINIO/auth/callback` e `http://localhost:3002/auth/callback`.

Em **Authentication › Sign In / Providers › Email**:

- *Confirm email* ligado (recomendado).
- *Allow new users to sign up*: **ligado** se quiser que qualquer pessoa crie conta e ganhe o teste grátis; **desligado** se você só vender e criar os clientes pelo painel `/admin`.

### 1.2 Modelos de e-mail (importante)

Em **Authentication › Emails › Templates**, troque o link de cada modelo para o formato abaixo. Assim o link funciona mesmo que o cliente abra o e-mail no celular e tenha pedido no computador, e o convite pelo painel funciona.

| Modelo | Link a usar no lugar de `{{ .ConfirmationURL }}` |
|---|---|
| Confirm signup | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email` |
| Invite user | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite` |
| Reset password | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery` |
| Magic link | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink` |
| Change email address | `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change` |

Exemplo do corpo do "Reset password":

```html
<h2>Criar nova senha</h2>
<p>Clique no link para criar uma nova senha:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Criar nova senha</a></p>
```

### 1.3 E-mail em produção (SMTP)

O e-mail embutido do Supabase envia só poucas mensagens por hora e serve para testes. Para vender, configure um SMTP em **Authentication › Emails › SMTP Settings** (Resend, Brevo, Amazon SES, etc.; vários têm plano gratuito). Sem isso, cadastros e recuperações de senha vão falhar quando houver vários clientes.

Se não quiser configurar SMTP agora: desligue *Confirm email* e crie os clientes pelo painel `/admin` com **senha provisória** (não envia e-mail nenhum).

---

## 2. Vercel

1. Suba a pasta do projeto (`Analise ADS`) para um repositório no GitHub (o `.env` NÃO vai junto; ele está no `.gitignore`).
2. Na Vercel: **Add New › Project** › importe o repositório.
   - O `package.json` fica na raiz do repositório, então **Root Directory** fica como está (`./`).
   - Framework: Next.js (detectado sozinho). Não mude os comandos de build.
3. Em **Environment Variables**, cadastre (para Production, Preview e Development):

   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave publishable/anon |
   | `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio` (sem barra no final) |
   | `NEXT_PUBLIC_LINK_ASSINATURA` | link do checkout/WhatsApp (opcional) |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave secret/service_role (opcional, libera criar clientes no painel) |

4. **Deploy**. Variáveis `NEXT_PUBLIC_*` entram no build: se mudar alguma depois, faça **Redeploy**.
5. Domínio próprio: **Settings › Domains**. Depois atualize `NEXT_PUBLIC_SITE_URL` (Vercel) e *Site URL* / *Redirect URLs* (Supabase).

---

## 3. Primeiro acesso

1. Abra o site, clique em **Criar conta** e cadastre-se com o seu e-mail.
2. No Supabase, **SQL Editor**, rode (com o seu e-mail):

   ```sql
   update public.perfis set papel = 'admin', status = 'ativo', acesso_ate = null
   where email = 'seu-email@exemplo.com';
   ```

3. Recarregue o site: vai aparecer o link **Admin** no topo.

## 4. Testes rápidos depois do deploy

- [ ] Criar uma conta de cliente (outro e-mail), confirmar pelo e-mail e entrar: aparece a faixa "Teste grátis".
- [ ] Salvar uma análise, sair, entrar de novo: ela continua lá.
- [ ] Entrar com o admin: o cliente aparece em `/admin`. Clicar em **Bloquear**: o cliente cai na tela de assinatura.
- [ ] **+30 dias**: o cliente volta a ter acesso.
- [ ] Recuperar senha pelo link "Esqueci minha senha".
- [ ] Com o cliente A logado, abrir a URL de uma análise do cliente B: deve dar "não encontrado".
