-- Adicionar coluna expires_at na tabela attendance_records
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day');

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_expires_at ON attendance_records(expires_at);

-- Atualizar comentário da tabela
COMMENT ON TABLE attendance_records IS 'Tabela de presença com expiração automática após 24 horas';

-- Criar função para limpar registros expirados
CREATE OR REPLACE FUNCTION cleanup_expired_attendance()
RETURNS void AS $$
BEGIN
  DELETE FROM attendance_records WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a limpeza diariamente
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_attendance()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_attendance();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS cleanup_expired_attendance_trigger ON attendance_records;
CREATE TRIGGER cleanup_expired_attendance_trigger
  AFTER INSERT ON attendance_records
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_expired_attendance(); 