import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos a Service Role Key para contornar RLS e ter acesso à API de Admin do Auth
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
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    });
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Opcional: Buscar dados complementares da tabela therapists para enriquecer
    const { data: therapists } = await supabaseAdmin
      .from('therapists')
      .select('email, name, whatsapp, specialty, photo_url');

    const enrichedUsers = await Promise.all(users.map(async user => {
      // Tenta encontrar se o usuário também é um terapeuta
      const isTherapist = therapists?.find(t => t.email?.toLowerCase() === user.email?.toLowerCase());
      
      // Resolução da URL do avatar com fallback
      const rawAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || isTherapist?.photo_url || null;
      
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || isTherapist?.name || 'Não informado',
        avatar_url: await toDataUri(rawAvatarUrl),
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        whatsapp: isTherapist?.whatsapp || user.user_metadata?.whatsapp || 'Não informado',
        role: isTherapist ? 'Terapeuta' : 'Cliente'
      };
    }));

    return NextResponse.json(enrichedUsers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
