# Configurar Notificações de Email — SafeBus

## 1. Criar conta Resend (gratuito)

1. Vai a https://resend.com e cria uma conta gratuita
2. Cria uma API Key em **API Keys → Create API Key**
3. Guarda a chave (ex: `re_xxxxxx`)

## 2. Configurar domínio de envio (opcional)

Se tiveres um domínio próprio, adiciona-o em **Domains** no Resend.
Caso contrário usa `onboarding@resend.dev` no campo `from` durante testes.

## 3. Adicionar a chave no Supabase

No painel do Supabase (https://supabase.com/dashboard):

1. Vai a **Project Settings → Edge Functions → Secrets**
2. Adiciona o secret:
   - Nome: `RESEND_API_KEY`
   - Valor: a chave do passo 1

## 4. Executar a migração SQL

No editor SQL do Supabase, executa o ficheiro:
```
supabase/migrations/20260428_email_notifications.sql
```

## 5. Fazer deploy da Edge Function

```bash
npx supabase functions deploy send-arrival-email --project-ref roxtaxlzzsecztwuings
```

## Como funciona

1. O motorista ativa o rastreamento GPS
2. A cada atualização de posição, o sistema calcula o ETA para cada paragem
3. Quando o autocarro está a **≤ 5 minutos** de uma paragem, a Edge Function é invocada
4. A Edge Function:
   - Verifica se já foi enviado email nos últimos 10 minutos (evita duplicados)
   - Busca todos os alunos e pais associados à paragem
   - Envia email personalizado para cada um via Resend
   - Regista o envio na tabela `email_notifications`

## Alterar o limiar de tempo

Em `src/services/etaService.ts`, linha:
```typescript
const EMAIL_ALERT_THRESHOLD_MINUTES = 5;
```
Muda `5` para o número de minutos que preferires.
