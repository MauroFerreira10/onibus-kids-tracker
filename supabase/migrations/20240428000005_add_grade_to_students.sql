-- Adicionar coluna grade na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS grade VARCHAR(50);

-- Adicionar coluna classroom na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS classroom VARCHAR(50);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);

-- Atualizar comentário da tabela
COMMENT ON TABLE students IS 'Tabela de estudantes com informações de série e turma'; 