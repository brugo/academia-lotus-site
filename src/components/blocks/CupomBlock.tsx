"use client";

import { useState } from "react";
import { RevealText } from "@/components/ui/RevealText";
import { Ticket, Copy, Check, Clock, Sparkles } from "lucide-react";
import type { PageBlock, CupomContent } from "@/lib/types";

export function CupomBlock({ block }: { block: PageBlock }) {
  const content = (block.content as unknown) as CupomContent;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.coupon_code || "LOTUS2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Format expiry date
  const formatExpiry = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block py-20 px-4 md:px-8 w-full bg-midnight-950 relative z-10">
        <RevealText className="max-w-3xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden border border-gold-500/20 bg-gradient-to-br from-midnight-900/80 via-midnight-950/90 to-midnight-900/80 backdrop-blur-xl shadow-[0_0_60px_rgba(212,175,55,0.08)]">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gold-500/5 blur-[60px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gold-500/5 blur-[60px] rounded-full" />
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-semibold tracking-widest uppercase">
                <Sparkles size={10} className="fill-gold-500" />
                Exclusivo
              </div>
            </div>

            {/* Dashed border separator (cupom style) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-midnight-950 rounded-r-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-midnight-950 rounded-l-full" />

            <div className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
              {/* Left: Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-gold-400 mb-4">
                  <Ticket size={20} />
                  <span className="text-xs font-medium tracking-widest uppercase">{content.title || "Cupom de Desconto"}</span>
                </div>

                <div className="font-serif text-4xl md:text-5xl text-white mb-3 tracking-tight">
                  {content.discount || "20% OFF"}
                </div>

                <p className="text-slate-400 font-light leading-relaxed max-w-sm mb-4">
                  {content.description || "Use o código abaixo e ganhe um desconto exclusivo."}
                </p>

                {content.expiry && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} />
                    Válido até {formatExpiry(content.expiry)}
                  </div>
                )}
              </div>

              {/* Right: Coupon Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="border-l-0 md:border-l border-dashed border-gold-500/20 md:pl-10 flex flex-col items-center gap-4">
                  <p className="text-[10px] tracking-widest uppercase text-slate-500 font-medium">Seu código</p>
                  <div className="bg-midnight-950 border border-gold-500/30 rounded-2xl px-8 py-4 text-center shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]">
                    <span className="font-mono text-2xl md:text-3xl text-gold-400 tracking-[0.3em] font-bold select-all">
                      {content.coupon_code || "LOTUS2026"}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      copied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-gold-500/10 text-gold-400 border border-gold-500/30 hover:bg-gold-500 hover:text-midnight-950"
                    }`}
                  >
                    {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar Código</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </RevealText>
      </section>

      {/* MOBILE */}
      <section className="md:hidden py-12 px-4 w-full bg-midnight-950 relative z-10">
        <div className="max-w-sm mx-auto relative rounded-3xl overflow-hidden border border-gold-500/20 bg-gradient-to-br from-midnight-900/80 via-midnight-950/90 to-midnight-900/80">
          {/* Cupom notches */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-midnight-950 rounded-r-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-midnight-950 rounded-l-full" />

          <div className="p-8 flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 text-gold-400">
              <Ticket size={18} />
              <span className="text-xs font-medium tracking-widest uppercase">{content.title || "Cupom"}</span>
            </div>

            <div className="font-serif text-4xl text-white tracking-tight">
              {content.discount || "20% OFF"}
            </div>

            <p className="text-slate-400 font-light text-sm leading-relaxed">
              {content.description || "Use o código abaixo e ganhe um desconto exclusivo."}
            </p>

            <div className="w-full border-t border-dashed border-gold-500/20 pt-6 flex flex-col items-center gap-3">
              <p className="text-[10px] tracking-widest uppercase text-slate-500 font-medium">Seu código</p>
              <div className="bg-midnight-950 border border-gold-500/30 rounded-2xl px-6 py-3">
                <span className="font-mono text-xl text-gold-400 tracking-[0.3em] font-bold select-all">
                  {content.coupon_code || "LOTUS2026"}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-gold-500/10 text-gold-400 border border-gold-500/30"
                }`}
              >
                {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>

            {content.expiry && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} />
                Válido até {formatExpiry(content.expiry)}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
