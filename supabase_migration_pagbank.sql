-- =============================================================================
-- Migração: Criar tabela pending_checkouts para integração PagBank
-- =============================================================================
-- Esta tabela armazena os metadados do agendamento durante o processo de checkout.
-- Como o PagBank não possui um campo "metadata" como o Stripe, usamos esta tabela
-- para vincular o reference_id do checkout com os dados do agendamento.
-- O webhook do PagBank usa o reference_id para recuperar estes dados após confirmação.
-- =============================================================================

CREATE TABLE IF NOT EXISTS pending_checkouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificador único do checkout (gerado pelo nosso sistema, enviado ao PagBank como reference_id)
  reference_id TEXT NOT NULL UNIQUE,
  
  -- ID do checkout no PagBank (ex: CHEC_XXXX)
  pagbank_checkout_id TEXT,
  
  -- ID do pedido/order no PagBank (preenchido pelo webhook quando o pagamento é confirmado)
  pagbank_order_id TEXT,
  
  -- Dados do agendamento (equivalentes ao metadata do Stripe)
  therapist_id UUID REFERENCES therapists(id),
  therapist_email TEXT NOT NULL,
  therapist_name TEXT DEFAULT '',
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_whatsapp TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  requested_service TEXT DEFAULT '',
  user_id UUID, -- ID do usuário autenticado (se houver)
  
  -- Valor em centavos
  amount_cents INTEGER NOT NULL DEFAULT 0,
  
  -- Status do checkout: pending, completed, expired, failed
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_reference_id ON pending_checkouts(reference_id);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_status ON pending_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_pagbank_checkout_id ON pending_checkouts(pagbank_checkout_id);

-- RLS: Permitir acesso total via Service Role (usado pelos webhooks e API routes)
ALTER TABLE pending_checkouts ENABLE ROW LEVEL SECURITY;

-- Policy: Service Role pode tudo (webhooks e server-side)
CREATE POLICY "Service role full access on pending_checkouts" 
  ON pending_checkouts 
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

-- Policy: Usuários autenticados podem ver seus próprios checkouts (para a página de sucesso)
CREATE POLICY "Users can view own pending_checkouts" 
  ON pending_checkouts 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- Policy: Anon pode ler checkouts por reference_id (para a página de sucesso via redirect)
CREATE POLICY "Anon can read pending_checkouts by reference_id"
  ON pending_checkouts
  FOR SELECT
  TO anon
  USING (true);
