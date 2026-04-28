import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArrivalEmailPayload {
  stopId: string;
  stopName: string;
  routeId: string;
  vehicleId: string;
  etaMinutes: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: ArrivalEmailPayload = await req.json();
    const { stopId, stopName, routeId, vehicleId, etaMinutes } = payload;

    // Verifica se já foi enviado email para esta paragem nos últimos 10 minutos
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: alreadySent } = await supabase
      .from('email_notifications')
      .select('id')
      .eq('stop_id', stopId)
      .eq('vehicle_id', vehicleId)
      .gte('sent_at', tenMinutesAgo)
      .maybeSingle();

    if (alreadySent) {
      return new Response(
        JSON.stringify({ message: 'Email já enviado recentemente para esta paragem' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Busca alunos associados à paragem nesta rota
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, parent_id')
      .eq('route_id', routeId)
      .eq('stop_id', stopId);

    if (studentsError || !students || students.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum aluno encontrado para esta paragem' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Colecta IDs únicos: alunos + pais
    const userIds = new Set<string>();
    students.forEach(s => {
      userIds.add(s.id);
      if (s.parent_id) userIds.add(s.parent_id);
    });

    // Busca emails via auth.users (requer service role)
    const emailPromises = Array.from(userIds).map(async (userId) => {
      const { data } = await supabase.auth.admin.getUserById(userId);
      return data?.user?.email || null;
    });

    const emailResults = await Promise.all(emailPromises);
    const emails = emailResults.filter(Boolean) as string[];

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum email encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const studentNames = students.map(s => s.name).join(', ');
    const etaText = etaMinutes <= 1 ? 'menos de 1 minuto' : `${etaMinutes} minutos`;

    // Envia emails via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    const emailSendPromises = emails.map(async (email) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'SafeBus <noreply@safebus.ao>',
          to: [email],
          subject: `🚌 O autocarro está a chegar! — ${stopName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:600px;width:100%;">

                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#1E3A8A,#2E4FA8);padding:32px 40px;text-align:center;">
                          <div style="background:#FBBF24;display:inline-block;border-radius:50%;padding:16px;margin-bottom:16px;">
                            <span style="font-size:32px;">🚌</span>
                          </div>
                          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">SafeBus</h1>
                          <p style="color:#FBBF24;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Segurança em cada trajeto</p>
                        </td>
                      </tr>

                      <!-- Alert Banner -->
                      <tr>
                        <td style="background:#FEF3C7;padding:16px 40px;text-align:center;border-left:4px solid #FBBF24;">
                          <p style="margin:0;color:#92400E;font-weight:700;font-size:16px;">
                            ⚠️ O autocarro está a chegar em <strong>${etaText}</strong>!
                          </p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <h2 style="color:#1E3A8A;margin:0 0 16px;font-size:20px;">Aviso de Chegada</h2>
                          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
                            O autocarro escolar está prestes a chegar ao ponto de recolha. Por favor, dirige-te ao ponto de embarque.
                          </p>

                          <!-- Info Cards -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                            <tr>
                              <td style="background:#EFF6FF;border-radius:8px;padding:16px;border-left:3px solid #1E3A8A;">
                                <p style="margin:0 0 4px;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Ponto de Recolha</p>
                                <p style="margin:0;color:#1E3A8A;font-weight:700;font-size:16px;">📍 ${stopName}</p>
                              </td>
                            </tr>
                            <tr><td style="height:12px;"></td></tr>
                            <tr>
                              <td style="background:#EFF6FF;border-radius:8px;padding:16px;border-left:3px solid #FBBF24;">
                                <p style="margin:0 0 4px;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Tempo Estimado</p>
                                <p style="margin:0;color:#1E3A8A;font-weight:700;font-size:16px;">⏱️ ${etaText}</p>
                              </td>
                            </tr>
                            <tr><td style="height:12px;"></td></tr>
                            <tr>
                              <td style="background:#EFF6FF;border-radius:8px;padding:16px;border-left:3px solid #10B981;">
                                <p style="margin:0 0 4px;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Aluno(s)</p>
                                <p style="margin:0;color:#1E3A8A;font-weight:700;font-size:16px;">👤 ${studentNames}</p>
                              </td>
                            </tr>
                          </table>

                          <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 8px;">
                            Por favor, certifica-te de que o aluno está pronto para embarcar.
                          </p>
                          <p style="color:#6B7280;font-size:13px;margin:0;">
                            Esta notificação foi enviada automaticamente pelo sistema SafeBus.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#F9FAFB;padding:24px 40px;border-top:1px solid #E5E7EB;text-align:center;">
                          <p style="color:#9CA3AF;font-size:12px;margin:0;">
                            © 2026 SafeBus — Segurança em cada trajeto
                          </p>
                          <p style="color:#9CA3AF;font-size:11px;margin:8px 0 0;">
                            Não respondas a este email. Notificação automática do sistema.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Erro ao enviar para ${email}:`, err);
      }
      return res.ok;
    });

    await Promise.all(emailSendPromises);

    // Regista o envio na tabela de controlo
    await supabase.from('email_notifications').insert({
      stop_id: stopId,
      vehicle_id: vehicleId,
      route_id: routeId,
      eta_minutes: etaMinutes,
      emails_sent: emails,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, emailsEnviados: emails.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
