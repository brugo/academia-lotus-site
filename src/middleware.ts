import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const url = request.nextUrl.clone()

  // Ignora a própria página de construção
  if (url.pathname === '/em-construcao') {
    return response
  }

  // Cria um cliente supabase local para ler o status de manutenção
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {} // Não precisamos setar cookies nesta leitura simples
      }
    }
  )

  const { data: maintenanceData } = await supabase
    .from('system_settings')
    .select('value')
    .eq('id', 'maintenance_mode')
    .single()

  const isMaintenanceMode = maintenanceData?.value?.enabled === true;

  // Se não estiver em manutenção, deixa passar tudo
  if (!isMaintenanceMode) {
    return response
  }

  // REGRAS DE EXCEÇÃO (QUANDO EM MANUTENÇÃO):
  // Ignora rotas de API, autenticação, painéis administrativos e arquivos estáticos
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/portal-terapeuta') ||
    url.pathname.startsWith('/jornada') ||
    url.pathname.includes('.') // Arquivos estáticos (favicon.ico, imagens, etc)
  ) {
    return response
  }

  // Se estiver em manutenção e não for nenhuma rota de exceção, bloqueia (incluindo /agendamento)
  url.pathname = '/em-construcao'
  const redirectResponse = NextResponse.redirect(url)
  
  // Repassa os cookies configurados pelo Supabase
  for (const cookie of response.cookies.getAll()) {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
  }
  
  return redirectResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
