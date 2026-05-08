import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Ignora a própria página de construção
  if (url.pathname === '/em-construcao') {
    return NextResponse.next();
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
    return NextResponse.next();
  }

  // Redireciona todas as outras rotas (inclusive a Home) para a página de construção
  url.pathname = '/em-construcao';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
