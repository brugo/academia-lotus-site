"use client";

import { RevealText } from "@/components/ui/RevealText";
import Link from "next/link";
import { Users } from "lucide-react";
import type { PageBlock, ListaTerapeutasContent } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { DatabaseTherapist } from "@/lib/types";

export function ListaTerapeutasBlock({ block }: { block: PageBlock }) {
  const content = (block.content as unknown) as ListaTerapeutasContent;
  const [therapists, setTherapists] = useState<DatabaseTherapist[]>([]);

  // Fetch real therapists from DB
  useEffect(() => {
    async function fetchTherapists() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from("therapists")
        .select("*")
        .eq("is_active", true)
        .limit(6);
      if (data) setTherapists(data as DatabaseTherapist[]);
    }
    fetchTherapists();
  }, []);

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block py-28 relative z-10 bg-midnight-950/80 backdrop-blur-xl border-y border-white/5 w-full">
        <div className="container mx-auto px-6">
          <div className="text-center md:max-w-4xl mx-auto mb-20">
            <RevealText element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
              <Users size={14} />
              Equipe
            </RevealText>
            <RevealText element="h2" delay={0.1} className="font-serif text-3xl md:text-5xl text-gold-400 mb-6">
              {content.title || "Nossos Terapeutas"}
            </RevealText>
            <RevealText delay={0.2} element="p" className="text-slate-400 text-xl font-light leading-relaxed">
              {content.subtitle || "Profissionais dedicados à sua cura"}
            </RevealText>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {therapists.map((therapist, index) => (
              <RevealText key={therapist.id} delay={0.1 + index * 0.15}>
                <Link
                  href="/terapeutas"
                  className="group block bg-midnight-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:bg-midnight-800/50 hover:border-gold-500/20 transition-all duration-500 text-center relative overflow-hidden"
                >
                  {/* Photo */}
                  <div className="w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold-500/30 transition-all duration-500 relative">
                    {therapist.photo_url ? (
                      <img
                        src={therapist.photo_url}
                        alt={therapist.name}
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-midnight-800 flex items-center justify-center text-gold-500/50">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-slate-200 mb-1">{therapist.name}</h3>
                  <p className="text-sm text-gold-400/70 font-light">{therapist.specialty}</p>

                  {/* Hover glow */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-gold-500/5 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </Link>
              </RevealText>
            ))}
          </div>

          {/* CTA */}
          <RevealText delay={0.5} className="text-center mt-14">
            <Link
              href="/terapeutas"
              className="inline-block px-10 py-4 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full hover:bg-gold-500 hover:text-midnight-950 transition-all duration-500 font-medium text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.1)]"
            >
              Ver Todos os Terapeutas
            </Link>
          </RevealText>
        </div>
      </section>

      {/* MOBILE */}
      <section className="md:hidden py-16 relative z-10 bg-midnight-950/80 border-y border-white/5 w-full">
        <div className="container mx-auto px-6">
          <div className="text-center mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-medium tracking-widest uppercase mb-4">
              <Users size={12} />
              Equipe
            </div>
            <h2 className="font-serif text-3xl text-gold-400 mb-4">{content.title || "Nossos Terapeutas"}</h2>
            <p className="text-slate-400 text-base font-light">{content.subtitle || "Profissionais dedicados à sua cura"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {therapists.map((therapist) => (
              <Link
                key={therapist.id}
                href="/terapeutas"
                className="group bg-midnight-900/40 border border-white/5 rounded-2xl p-5 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-white/10">
                  {therapist.photo_url ? (
                    <img src={therapist.photo_url} alt={therapist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-midnight-800 flex items-center justify-center text-gold-500/50">
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-sm text-slate-200 mb-1 truncate">{therapist.name}</h3>
                <p className="text-xs text-gold-400/70 font-light truncate">{therapist.specialty}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/terapeutas"
              className="inline-block px-8 py-3 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full font-medium text-xs tracking-widest uppercase"
            >
              Ver Todos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
