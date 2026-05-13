-- ============================================
-- Migration: Tabela de Depoimentos (Testimonials)
-- ============================================

-- Dropar tabela se existir (para rodar novamente caso necessário)
DROP TABLE IF EXISTS testimonials;

-- Tabela principal de depoimentos
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode ver depoimentos aprovados
CREATE POLICY "Depoimentos aprovados são públicos"
  ON testimonials FOR SELECT
  USING (status = 'approved');

-- Política: Usuários autenticados podem ver seus próprios depoimentos (qualquer status)
CREATE POLICY "Usuários veem seus próprios depoimentos"
  ON testimonials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: Usuários autenticados podem inserir seus próprios depoimentos
CREATE POLICY "Usuários podem criar depoimentos"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política: Service role pode fazer tudo (usado pela API server-side)
-- As operações de admin (aprovar/rejeitar/deletar) serão feitas via service_role key
CREATE POLICY "Service role full access"
  ON testimonials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_testimonial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_testimonials_updated_at ON testimonials;
CREATE TRIGGER trigger_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonial_updated_at();
