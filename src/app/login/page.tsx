"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff, AlertCircle, Mail, LogIn, UserPlus } from "lucide-react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') || '/';
  
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Google.");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`
          }
        });
        if (error) throw error;
        setMessage("Verifique seu email para confirmar o cadastro.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-midnight-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-midnight-950 border border-white/10 text-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <span className="font-serif text-3xl italic mr-1 mt-1">L</span>
        </div>
        <h1 className="font-serif text-3xl text-slate-100 mb-2">Bem-vindo(a)</h1>
        <p className="text-slate-400 font-light text-sm">
          {isRegistering ? "Crie sua conta na Academia Lótus" : "Acesse sua conta para continuar"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-green-950/50 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-200 text-sm">
          <AlertCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-white text-gray-900 rounded-xl font-medium tracking-wide hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar com Google
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">ou</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-slate-300 uppercase">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-midnight-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all font-light"
                required
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-medium tracking-wide text-slate-300 uppercase">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all font-light"
                required
                minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 rounded-xl font-medium tracking-wide hover:from-gold-500 hover:to-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:ring-offset-2 focus:ring-offset-midnight-950 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2"
          >
            {loading ? "Processando..." : (isRegistering ? <><UserPlus size={18} /> Criar Conta</> : <><LogIn size={18} /> Entrar</>)}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-slate-400 hover:text-gold-400 transition-colors"
            type="button"
          >
            {isRegistering ? "Já tem uma conta? Entre aqui." : "Não tem conta? Cadastre-se."}
          </button>
          
          {!isRegistering && (
            <div className="pt-2">
              <button className="text-xs text-slate-500 hover:text-gold-400 transition-colors">
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-3xl max-h-3xl bg-gold-900/10 blur-[150px] rounded-full pointer-events-none" />

      <Suspense fallback={<div className="text-gold-500 z-10">Carregando...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
