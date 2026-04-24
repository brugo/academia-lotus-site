"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirecionar para login caso não haja sessão
        router.push("/login?redirect_to=" + encodeURIComponent(pathname));
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-gold-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span className="text-sm tracking-widest font-light text-slate-300">Autenticando...</span>
      </div>
    );
  }

  return <>{children}</>;
}
