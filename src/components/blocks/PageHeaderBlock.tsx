import { PageBlock } from "@/lib/types";
import { RevealText } from "@/components/ui/RevealText";
import React from "react";

export function PageHeaderBlock({ block }: { block: PageBlock }) {
  const content = block.content || {};
  const badge = String(content.badge || "");
  const title1 = String(content.title1 || "");
  const title2 = String(content.title2 || "");
  const description = String(content.description || "");

  const ptMap: Record<string, string> = {
    none: "pt-0",
    small: "pt-8 md:pt-12",
    medium: "pt-16 md:pt-24",
    large: "pt-24 md:pt-36",
    xl: "pt-32 md:pt-48",
  };

  const pbMap: Record<string, string> = {
    none: "pb-0",
    small: "pb-8 md:pb-12",
    medium: "pb-16 md:pb-24",
    large: "pb-24 md:pb-36",
    xl: "pb-32 md:pb-48",
  };

  const ptClass = typeof content.padding_top === 'string' && ptMap[content.padding_top] ? ptMap[content.padding_top] : ptMap["large"];
  const pbClass = typeof content.padding_bottom === 'string' && pbMap[content.padding_bottom] ? pbMap[content.padding_bottom] : pbMap["medium"];

  return (
    <div className={`w-full relative z-10 ${ptClass} ${pbClass}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <RevealText delay={0.1} element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
              {badge}
            </RevealText>
          )}
          <RevealText delay={0.2} element="h1" className="font-serif text-5xl md:text-7xl text-white mb-6">
            {title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-2">{title2}</span>
          </RevealText>
          <RevealText delay={0.3} element="p" className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto text-balance">
            {description}
          </RevealText>
        </div>
      </div>
    </div>
  );
}
