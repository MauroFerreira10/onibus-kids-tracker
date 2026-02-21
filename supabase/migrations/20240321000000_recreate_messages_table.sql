-- Remover a tabela de mensagens existente
drop table if exists messages;

-- Recriar a tabela de mensagens com a estrutura correta
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  content text not null,
  sender_id uuid not null,
  sender_name text not null,
  sender_role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar índices para melhor performance
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);
create index if not exists messages_sender_id_idx on messages(sender_id);

-- Habilitar RLS (Row Level Security)
alter table messages enable row level security;

-- Criar políticas de segurança para mensagens
create policy "Usuários podem ver mensagens de suas conversas"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and auth.uid() = any(participants)
    )
  );

create policy "Usuários podem enviar mensagens em suas conversas"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and auth.uid() = any(participants)
    )
  );

-- Recriar a função e trigger para atualizar o updated_at da conversa
create or replace function update_conversation_updated_at()
returns trigger as $$
begin
  update conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger update_conversation_updated_at
  after insert on messages
  for each row
  execute function update_conversation_updated_at(); 