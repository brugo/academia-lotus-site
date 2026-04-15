"use client";

import { RevealText } from "@/components/ui/RevealText";
import Link from "next/link";
import type { PageBlock, CtaSectionContent } from "@/lib/types";

export function CtaSectionBlock({ block }: { block: PageBlock }) {
  const content = (block.content as unknown) as CtaSectionContent;

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:flex min-h-[60vh] flex-col items-center justify-center relative z-10 py-32 bg-midnight-950 w-full">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <RevealText element="h2" className="font-serif text-4xl md:text-6xl text-slate-200 mb-8 font-medium">
            {content.title || "Sua alma já conhece o caminho."}
          </RevealText>
          <RevealText delay={0.2} element="p" className="text-xl text-slate-400 font-light mb-16">
            {content.subtitle || "Dê apenas o primeiro passo. Nós te acompanhamos."}
          </RevealText>
          <RevealText delay={0.4}>
            <Link href={content.button_link || "/"} className="inline-block px-12 py-5 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full hover:bg-gold-500 hover:text-midnight-950 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] font-medium text-lg tracking-widest uppercase cursor-pointer">
              {content.button_text || "Descubra sua Lótus"}
            </Link>
          </RevealText>
        </div>
      </section>

      {/* MOBILE */}
      <section className="md:hidden flex flex-col items-center justify-center relative z-10 py-20 bg-midnight-950 w-full">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-slate-200 mb-6 font-medium">
            {content.title || "Sua alma já conhece o caminho."}
          </h2>
          <p className="text-lg text-slate-400 font-light mb-12">
            {content.subtitle || "Dê apenas o primeiro passo. Nós te acompanhamos."}
          </p>
          <Link href={content.button_link || "/"} className="inline-block px-10 py-4 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full font-medium text-base tracking-widest uppercase">
            {content.button_text || "Descubra sua Lótus"}
          </Link>
        </div>
      </section>
    </>
  );
}
