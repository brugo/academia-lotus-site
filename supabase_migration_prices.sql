-- 1. Adicionar o preço na tabela de serviços (técnicas)
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price NUMERIC DEFAULT 150;

-- 2. Criar tabela para configurações globais do sistema (como a taxa de agendamento)
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir a configuração padrão da taxa de reserva (Ex: R$ 50)
INSERT INTO system_settings (id, value) 
VALUES ('reservation_fee', '{"amount": 50}') 
ON CONFLICT (id) DO NOTHING;

-- 4. Permitir leitura pública das configurações
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura publica das configuracoes" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Permitir edição para administradores" ON system_settings FOR ALL USING (auth.role() = 'authenticated');
