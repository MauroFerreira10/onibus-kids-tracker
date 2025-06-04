-- Habilitar RLS na tabela invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para invitations
DO $$ 
BEGIN
  -- Política para permitir que gestores vejam todos os convites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Gestores podem ver todos os convites'
  ) THEN
    CREATE POLICY "Gestores podem ver todos os convites"
      ON invitations FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'manager'
        )
      );
  END IF;

  -- Política para permitir que gestores criem convites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Gestores podem criar convites'
  ) THEN
    CREATE POLICY "Gestores podem criar convites"
      ON invitations FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'manager'
        )
      );
  END IF;

  -- Política para permitir que gestores atualizem convites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Gestores podem atualizar convites'
  ) THEN
    CREATE POLICY "Gestores podem atualizar convites"
      ON invitations FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'manager'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'manager'
        )
      );
  END IF;
END $$; 