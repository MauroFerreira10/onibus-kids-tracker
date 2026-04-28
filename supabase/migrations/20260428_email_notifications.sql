-- Tabela de controlo de emails enviados para evitar duplicados
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  eta_minutes INTEGER NOT NULL,
  emails_sent TEXT[] NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para pesquisa rápida por paragem + veículo + data
CREATE INDEX IF NOT EXISTS idx_email_notifications_stop_vehicle_sent
  ON email_notifications(stop_id, vehicle_id, sent_at DESC);

-- Limpa registos com mais de 24 horas automaticamente
CREATE OR REPLACE FUNCTION cleanup_old_email_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM email_notifications
  WHERE sent_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- RLS: apenas service role pode inserir/ler
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON email_notifications
  FOR ALL
  USING (auth.role() = 'service_role');
