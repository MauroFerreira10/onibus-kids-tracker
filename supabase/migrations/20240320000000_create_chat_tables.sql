-- Criar tabela de conversas se não existir
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  participants uuid[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de mensagens se não existir
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  content text not null,
  sender_id uuid not null,
  sender_name text not null,
  sender_role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Verificar e criar índices se necessário
do $$ 
declare
  column_exists boolean;
begin
  -- Verificar se a coluna conversation_id existe
  select exists (
    select 1 
    from information_schema.columns 
    where table_name = 'messages' 
    and column_name = 'conversation_id'
  ) into column_exists;

  if column_exists then
    -- Criar índices apenas se a coluna existir
    if not exists (select 1 from pg_indexes where indexname = 'messages_conversation_id_idx') then
      create index messages_conversation_id_idx on messages(conversation_id);
    end if;
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'messages_created_at_idx') then
    create index messages_created_at_idx on messages(created_at);
  end if;
end $$;

-- Criar função para atualizar o updated_at da conversa
create or replace function update_conversation_updated_at()
returns trigger as $$
begin
  update conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

-- Criar trigger se não existir
do $$ 
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'update_conversation_updated_at'
  ) then
    create trigger update_conversation_updated_at
      after insert on messages
      for each row
      execute function update_conversation_updated_at();
  end if;
end $$;

-- Habilitar RLS (Row Level Security)
alter table conversations enable row level security;
alter table messages enable row level security;
alter table profiles enable row level security;

-- Remover políticas de leitura existentes para perfis que possam causar conflito
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Usuários podem ver seus próprios perfis" on profiles;

-- Criar política para permitir que usuários autenticados vejam todos os perfis
create policy "Allow authenticated users to view all profiles"
  on profiles for select
  to authenticated
  using (true);

-- Criar políticas de segurança para conversas se não existirem
do $$ 
declare
  column_exists boolean;
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'conversations' 
    and policyname = 'Usuários podem ver suas próprias conversas'
  ) then
    create policy "Usuários podem ver suas próprias conversas"
      on conversations for select
      using (
        auth.uid() = any(participants)
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'conversations' 
    and policyname = 'Usuários podem criar conversas'
  ) then
    create policy "Usuários podem criar conversas"
      on conversations for insert
      with check (
        auth.uid() = any(participants)
      );
  end if;
end $$;

-- Criar políticas de segurança para mensagens se não existirem
do $$ 
declare
  column_exists boolean;
begin
  -- Verificar se a coluna conversation_id existe
  select exists (
    select 1 
    from information_schema.columns 
    where table_name = 'messages' 
    and column_name = 'conversation_id'
  ) into column_exists;

  if column_exists then
    if not exists (
      select 1 from pg_policies 
      where tablename = 'messages' 
      and policyname = 'Usuários podem ver mensagens de suas conversas'
    ) then
      create policy "Usuários podem ver mensagens de suas conversas"
        on messages for select
        using (
          exists (
            select 1 from conversations
            where id = messages.conversation_id
            and auth.uid() = any(participants)
          )
        );
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'messages' 
      and policyname = 'Usuários podem enviar mensagens em suas conversas'
    ) then
      create policy "Usuários podem enviar mensagens em suas conversas"
        on messages for insert
        with check (
          exists (
            select 1 from conversations
            where id = messages.conversation_id
            and auth.uid() = any(participants)
          )
        );
    end if;
  end if;
end $$; 