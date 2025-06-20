-- Adicionar coluna status à tabela trip_history
ALTER TABLE trip_history
ADD COLUMN status TEXT DEFAULT 'in_progress';

-- Opcional: Adicionar índice na coluna status se houver muitas consultas baseadas nela
-- CREATE INDEX idx_trip_history_status ON trip_history(status);

-- Opcional: Atualizar registros existentes (se necessário, dependendo do estado inicial desejado)
-- UPDATE trip_history SET status = 'completed' WHERE end_time IS NOT NULL AND status IS NULL; 