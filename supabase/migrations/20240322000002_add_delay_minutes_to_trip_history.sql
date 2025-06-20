-- Adicionar coluna delay_minutes à tabela trip_history
ALTER TABLE trip_history
ADD COLUMN delay_minutes INTEGER DEFAULT 0;

-- Opcional: Adicionar índice se necessário
-- CREATE INDEX idx_trip_history_delay_minutes ON trip_history(delay_minutes); 