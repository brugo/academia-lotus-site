"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }
    // We could fetch the session status from our backend here if needed
    setLoading(false);
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-950">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-gradient-to-b from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-3xl p-10 max-w-xl w-full shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-gold-400" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-4">Pagamento Confirmado!</h1>
        <p className="text-slate-300 text-lg mb-8 font-light">
          Sua sessão foi paga com sucesso. Você e o terapeuta receberão em breve um convite oficial na sua agenda do Google com o link do encontro.
        </p>
        
        <button 
          onClick={() => router.push("/jornada")}
          className="w-full px-6 py-4 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          Acessar Meu Perfil <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight-950"></div>}>
      <SuccessContent />
    </Suspense>
  );
}

