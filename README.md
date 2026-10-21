# Hábitos & Metas — Expo + Supabase (versão atualizada)

App Web/Mobile de hábitos e metas feito com Expo (Expo Router), React Native, Supabase e React Query.

## O que há de novo nesta versão

| Novidade | Onde |
|---|---|
| Tela de **Perfil** (e-mail, avatar com iniciais, estatísticas, botão "Sair da conta") | `app/(tabs)/profile.tsx` + aba em `app/(tabs)/_layout.tsx` |
| **Card de hábito** com check-in animado, ícones de editar (lápis) e excluir (lixeira com confirmação) | `components/HabitCard.tsx`, `app/(tabs)/index.tsx` |
| **Horário opcional** no hábito (campo `HH:MM`; hábitos com horário aparecem primeiro, do mais cedo ao mais tarde) | `components/HabitFormModal.tsx`, `hooks/useHabits.ts`, `lib/types.ts` |
| **Nova coluna no banco**: `habits.reminder_time` | `supabase/migrations/002_habit_reminder_time.sql` e `supabase/schema.sql` |

Arquivos novos: `app/(tabs)/profile.tsx`, `components/HabitCard.tsx`, `supabase/migrations/002_habit_reminder_time.sql`.
Arquivos alterados: `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `components/HabitFormModal.tsx`, `hooks/useHabits.ts`, `lib/types.ts`, `supabase/schema.sql`.

---

## Passo a passo

### 1. Pré-requisitos
- Node.js (versão LTS atual) e npm.
- Uma conta e um projeto no [Supabase](https://supabase.com).
- Para testar no celular: app **Expo Go** (mesma rede Wi‑Fi do computador) ou um emulador Android/iOS. Para testar no navegador, nada além do Node.

### 2. Aplicar as atualizações no seu projeto
1. Feche o servidor do Expo, se estiver rodando (Ctrl+C).
2. (Recomendado) Faça um commit ou backup do projeto atual.
3. Extraia o `.zip` e copie as pastas `app/`, `components/`, `hooks/`, `lib/`, `providers/` e `supabase/` para a raiz do seu projeto `habit-tracker`, **aceitando substituir** os arquivos existentes.
4. Este zip **não contém** `.env`, `node_modules`, `package.json`, `app.json` nem `tsconfig.json`; nada disso é sobrescrito.

### 3. Atualizar o Supabase

**Cenário A — você já tinha rodado o `schema.sql` antes (caso mais comum):**
1. No painel do Supabase, abra **SQL Editor → New query**.
2. Cole o conteúdo de `supabase/migrations/002_habit_reminder_time.sql` e clique em **Run**:
   ```sql
   alter table public.habits
     add column if not exists reminder_time time;
   ```
   Pode rodar mais de uma vez sem problema (`if not exists`).
3. Confira se a coluna existe:
   ```sql
   select column_name, data_type
   from information_schema.columns
   where table_schema = 'public' and table_name = 'habits'
   order by ordinal_position;
   ```
   A lista deve incluir `reminder_time | time without time zone`.
4. Nenhuma política (RLS) precisa mudar: as políticas de `habits` já valem para a nova coluna. Seus hábitos e histórico existentes continuam intactos (o horário fica vazio neles).

**Cenário B — projeto Supabase novo (nunca rodou o schema):**
1. **SQL Editor → New query**, cole **todo** o `supabase/schema.sql` e clique em **Run**. Ele já cria tabelas, RLS, trigger de perfil e a coluna `reminder_time`. Não precisa rodar a migração 002.
2. Confirme em **Table Editor** que existem `profiles`, `habits`, `habit_logs` e `goals`.

**Autenticação (nos dois cenários):**
- Em **Authentication → Providers → Email**, mantenha o provedor ativo.
- Para testar rápido, você pode desativar **Confirm email**; com ele ativo, o app avisa que é preciso confirmar o e-mail antes de entrar.

### 4. Configurar o `.env`
Na raiz do projeto, o arquivo `.env` deve ter (Project Settings → API no Supabase):
```
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_OU_PUBLISHABLE_KEY
```
Use apenas a chave **anon/publishable**, nunca a `service_role`. Se você já tinha o `.env`, não precisa mudar nada.

### 5. Instalar dependências
Na raiz do projeto:
```bash
npm install
```
Esta atualização não adiciona nenhuma dependência nova. Se o Expo reclamar de versões, rode `npx expo install --fix`.

### 6. Verificar o código (opcional, recomendado)
```bash
npx tsc --noEmit
npx expo lint
```

### 7. Rodar
```bash
npx expo start -c
```
O `-c` limpa o cache do Metro e garante que o `.env` seja lido de novo. No terminal:
- `w` abre no **navegador**;
- `a` abre no emulador **Android**; `i` no simulador **iOS** (macOS);
- ou escaneie o **QR code** com o Expo Go no celular.

Se o Expo Go não abrir o projeto por incompatibilidade de SDK, use o navegador (`w`) ou gere um development build (`npx expo run:android` / `npx expo run:ios`).

### 8. Checklist de teste
1. Entre com sua conta (ou crie uma em "Ainda não tenho conta").
2. Aba **Hoje** → **Novo hábito** → preencha o nome, escolha a frequência e informe um horário (digite `0730` e ele vira `07:30`) → **Salvar**.
3. Toque no círculo do card: ele pulsa, o card fica verde com o título riscado e aparece "Concluído hoje". Toque de novo para desmarcar.
4. Toque no **lápis** → altere nome, frequência ou horário → **Salvar**.
5. Toque na **lixeira** → confirme a exclusão.
6. Aba **Metas** → crie uma meta e registre progresso.
7. Aba **Perfil** → confira e-mail, iniciais, estatísticas e use **Sair da conta** (volta para o login).

### 9. Problemas comuns
| Sintoma | Causa provável e solução |
|---|---|
| `column habits.reminder_time does not exist` ou erro ao carregar/salvar hábitos | A migração 002 não foi executada. Rode o passo 3. |
| "Defina EXPO_PUBLIC_SUPABASE_URL…" ao abrir | `.env` ausente ou fora da raiz. Corrija e reinicie com `npx expo start -c`. |
| `new row violates row-level security policy` | O schema/RLS não foi aplicado no projeto Supabase em uso, ou o `.env` aponta para outro projeto. |
| Depois do cadastro nada acontece | "Confirm email" está ativo: confirme o e-mail ou desative a opção em Authentication → Providers → Email. |
| Aba Perfil não aparece | Verifique se `app/(tabs)/profile.tsx` existe e se `app/(tabs)/_layout.tsx` foi substituído; reinicie com `-c`. |
| Streak não passa de ~120 dias | É um limite proposital: o app carrega os últimos 120 dias de check-ins (`LOG_WINDOW_DAYS` em `hooks/useHabits.ts`). |

### 10. Estrutura do projeto
```
app/
  _layout.tsx            rotas protegidas por sessão
  (auth)/login.tsx       login e cadastro
  (tabs)/
    _layout.tsx          abas Hoje, Metas, Perfil
    index.tsx            dashboard de hábitos
    goals.tsx            metas
    profile.tsx          perfil e estatísticas
components/              HabitCard, HabitFormModal, GoalFormModal, ConsistencyGrid, ui
hooks/                   useHabits, useGoals (React Query)
lib/                     supabase, tema, tipos, datas/streak, confirm
providers/               AuthProvider
supabase/
  schema.sql             schema completo (instalação nova)
  migrations/            002_habit_reminder_time.sql (atualização)
```
