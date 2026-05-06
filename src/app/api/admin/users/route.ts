import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos a Service Role Key para contornar RLS e ter acesso à API de Admin do Auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Opcional: Buscar dados complementares da tabela therapists para enriquecer
    const { data: therapists } = await supabaseAdmin
      .from('therapists')
      .select('email, name, whatsapp, specialty');

    const enrichedUsers = users.map(user => {
      // Tenta encontrar se o usuário também é um terapeuta
      const isTherapist = therapists?.find(t => t.email?.toLowerCase() === user.email?.toLowerCase());
      
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || isTherapist?.name || 'Não informado',
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        whatsapp: isTherapist?.whatsapp || 'Não informado', // Pode ser expandido depois para pegar de uma tabela de profiles
        role: isTherapist ? 'Terapeuta' : 'Cliente'
      };
    });

    return NextResponse.json(enrichedUsers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
