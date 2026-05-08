import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)
  const url = request.nextUrl.clone()

  // Ignora a própria página de construção
  if (url.pathname === '/em-construcao') {
    return response
  }

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

  // Redireciona todas as outras rotas (inclusive a Home) para a página de construção
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
