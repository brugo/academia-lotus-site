import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Tenta ler o redirecionamento do cookie (caso venha do login via Google) ou do parâmetro
  const cookieStore = await cookies()
  const cookieNext = cookieStore.get('sb_redirect_to')?.value
  const next = searchParams.get('next') ?? cookieNext ?? '/'

  let safeOrigin = origin;
  if (safeOrigin.includes('0.0.0.0')) {
    safeOrigin = safeOrigin.replace('0.0.0.0', 'localhost');
  }

  // Prepara a URL de redirecionamento final de sucesso
  let redirectUrl = `${safeOrigin}${next}`
  const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (!isLocalEnv && forwardedHost) {
    redirectUrl = `https://${forwardedHost}${next}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(redirectUrl)
      // Deleta o cookie de redirecionamento após o login com sucesso para não acumular lixo
      response.cookies.delete('sb_redirect_to')
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${safeOrigin}/login?error=Falha na autenticação. Tente novamente.`)
}
