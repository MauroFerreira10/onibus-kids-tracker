-- Adicionar coluna pickup_address na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS pickup_address TEXT;

-- Adicionar coluna return_address na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS return_address TEXT;

-- Adicionar coluna pickup_time na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS pickup_time TIME;

-- Adicionar coluna return_time na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS return_time TIME;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_students_pickup_time ON students(pickup_time);
CREATE INDEX IF NOT EXISTS idx_students_return_time ON students(return_time);

-- Atualizar comentário da tabela
COMMENT ON TABLE students IS 'Tabela de estudantes com informações de endereços e horários de coleta/entrega'; 