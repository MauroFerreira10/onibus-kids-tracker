-- Adicionar coluna route_id na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES routes(id) ON DELETE SET NULL;

-- Adicionar coluna stop_id na tabela students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS stop_id UUID REFERENCES stops(id) ON DELETE SET NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_students_route_id ON students(route_id);
CREATE INDEX IF NOT EXISTS idx_students_stop_id ON students(stop_id);

-- Atualizar a interface Student no types.ts
COMMENT ON TABLE students IS 'Tabela de estudantes com referências para rotas e paradas'; 