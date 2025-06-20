-- Adicionar coluna file_url à tabela messages
ALTER TABLE messages
ADD COLUMN file_url TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS messages_file_url_idx ON messages(file_url);

-- Atualizar as políticas de segurança para incluir a nova coluna
DROP POLICY IF EXISTS "Usuários podem ver mensagens de suas conversas" ON messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens em suas conversas" ON messages;

CREATE POLICY "Usuários podem ver mensagens de suas conversas"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND auth.uid() = any(participants)
    )
  );

CREATE POLICY "Usuários podem enviar mensagens em suas conversas"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND auth.uid() = any(participants)
    )
  ); 