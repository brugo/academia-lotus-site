-- Tabela de disponibilidade dos terapeutas
-- Armazena horários semanais recorrentes e bloqueios por data específica

CREATE TABLE IF NOT EXISTS therapist_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('weekly', 'date_override')),
  -- Para weekly: 0=domingo, 1=segunda... 6=sábado
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- Para date_override:
  specific_date DATE,
  -- Faixas de horário: [{"start":"10:00","end":"12:00"},{"start":"15:00","end":"18:00"}]
  time_slots JSONB NOT NULL DEFAULT '[]',
  -- Se true, dia inteiro bloqueado
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices únicos para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_therapist_weekly 
  ON therapist_availability (therapist_id, day_of_week) 
  WHERE rule_type = 'weekly' AND day_of_week IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_therapist_date_override 
  ON therapist_availability (therapist_id, specific_date) 
  WHERE rule_type = 'date_override' AND specific_date IS NOT NULL;

-- RLS: permitir leitura pública (para o sistema de agendamento) e escrita por terapeutas autenticados
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;

-- Política de leitura: qualquer um pode ler
CREATE POLICY "Leitura pública da disponibilidade" ON therapist_availability
  FOR SELECT USING (true);

-- Política de inserção: usuário autenticado
CREATE POLICY "Terapeuta pode inserir sua disponibilidade" ON therapist_availability
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política de update: usuário autenticado
CREATE POLICY "Terapeuta pode atualizar sua disponibilidade" ON therapist_availability
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política de delete: usuário autenticado
CREATE POLICY "Terapeuta pode deletar sua disponibilidade" ON therapist_availability
  FOR DELETE USING (auth.role() = 'authenticated');
