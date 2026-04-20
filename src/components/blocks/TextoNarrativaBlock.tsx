"use client";

import { PageBlock, TextoNarrativaContent } from "@/lib/types";
import { RevealText } from "@/components/ui/RevealText";

export function TextoNarrativaBlock({ block }: { block: PageBlock }) {
  const content = block.content as unknown as TextoNarrativaContent;

  return (
    <div className="w-full relative z-10 py-24 md:py-32 px-6">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center relative">
          
          {content.pre_title && (
            <RevealText delay={0.1} element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6 shadow-[#d4af37]/10 shadow-lg">
              {content.pre_title}
            </RevealText>
          )}

          {content.title && (
            <RevealText delay={0.2} element="h2" className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight text-balance leading-tight drop-shadow-lg">
              {content.title.split('&').map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-2 font-light drop-shadow-xl">&</span>
                  )}
                </span>
              ))}
            </RevealText>
          )}

          {content.body && (
            <RevealText delay={0.3} element="p" className="text-xl md:text-2xl text-slate-400/90 font-light leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              {content.body}
            </RevealText>
          )}

        </div>
      </div>
    </div>
  );
}
