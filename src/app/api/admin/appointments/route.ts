import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos a Service Role Key para contornar RLS e ler todos os agendamentos e terapeutas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Converte uma URL de imagem do Google em data URI base64.
 * Isso contorna completamente qualquer bloqueio de CORS/referrer do browser,
 * pois a imagem é baixada server-side e enviada inline como base64.
 */
async function toDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  
  // Só faz proxy de URLs do Google (outras já funcionam no browser)
  if (!url.includes('googleusercontent.com')) return url;
  
  try {
    const response = await fetch(url, { 
      headers: { 'Accept': 'image/*' },
    });
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // 1. Buscar todos os agendamentos cadastrados ordenados pelo horário de início de forma decrescente
    const { data: appointments, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: false });

    if (apptError) {
      console.error("Erro ao buscar agendamentos no painel admin:", apptError);
      return NextResponse.json({ error: apptError.message }, { status: 500 });
    }

    // 2. Buscar dados de todos os terapeutas para enriquecer os agendamentos com seus nomes e contatos
    const { data: therapists, error: therapistError } = await supabaseAdmin
      .from('therapists')
      .select('id, name, email, whatsapp, specialty, photo_url');

    if (therapistError) {
      console.error("Erro ao buscar terapeutas para enriquecimento de agendamentos:", therapistError);
    }

    // 3. Buscar usuários do Auth para obter fotos de avatar de clientes
    const { data: { users: authUsers } = { users: [] }, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    });
    if (authUsersError) {
      console.error("Erro ao buscar usuários do Auth para fotos de agendamentos:", authUsersError);
    }

    // 4. Cruzar os dados dos agendamentos com as tabelas de terapeutas e usuários em memória
    const enrichedAppointments = await Promise.all((appointments || []).map(async appt => {
      const therapist = therapists?.find(t => t.id === appt.therapist_id);
      const apptEmailClean = (appt.client_email || '').trim().toLowerCase();
      
      const clientUser = authUsers.find(u => (u.email || '').trim().toLowerCase() === apptEmailClean);
      // Fallback: Se o cliente do agendamento também for um terapeuta cadastrado, usa a foto dele da tabela therapists
      const clientAsTherapist = therapists?.find(t => (t.email || '').trim().toLowerCase() === apptEmailClean);

      // Resolução da URL do avatar do cliente com fallback
      const rawClientAvatar = clientUser?.user_metadata?.avatar_url || clientUser?.user_metadata?.picture || clientAsTherapist?.photo_url || null;

      return {
        id: appt.id,
        therapist_id: appt.therapist_id,
        client_name: appt.client_name,
        client_email: appt.client_email,
        client_whatsapp: appt.client_whatsapp || 'Não informado',
        client_avatar_url: await toDataUri(rawClientAvatar),
        service_name: appt.service_name || 'Sessão Lótus',
        start_time: appt.start_time,
        end_time: appt.end_time,
        google_event_id: appt.google_event_id,
        meet_link: appt.meet_link || null,
        created_at: appt.created_at,
        therapist_name: therapist?.name || 'Não atribuído',
        therapist_email: therapist?.email || '',
        therapist_whatsapp: therapist?.whatsapp || '',
        therapist_photo_url: await toDataUri(therapist?.photo_url || null)
      };
    }));

    return NextResponse.json(enrichedAppointments);
  } catch (err: any) {
    console.error("Erro interno ao carregar agendamentos admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
