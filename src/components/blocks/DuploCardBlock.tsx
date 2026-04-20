"use client";

import { PageBlock, DuploCardContent } from "@/lib/types";
import { RevealText } from "@/components/ui/RevealText";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function DuploCardBlock({ block }: { block: PageBlock }) {
  const content = block.content as unknown as DuploCardContent;
  const card1 = content.card1;
  const card2 = content.card2;

  if (!card1 || !card2) return null;

  return (
    <div className="w-full relative z-10 py-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <RevealText delay={0.2} className="h-full">
          <div className="h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 hover:border-gold-500/20 transition-all duration-500 flex flex-col group relative overflow-hidden">
            {/* Background image overlay */}
            {card1.image_url && (
              <>
                <img src={card1.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-700 grayscale group-hover:grayscale-[0.5]" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/90 via-midnight-900/50 to-transparent" />
              </>
            )}
            
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="font-serif text-2xl text-slate-200 mb-4">{card1.title}</h3>
              <p className="text-slate-400 font-light leading-relaxed flex-grow mb-8 text-lg">
                {card1.description}
              </p>
              
              {card1.button_text && (
                <Link 
                  href={card1.button_link || '#'}
                  className="text-gold-500 font-medium tracking-wider flex items-center gap-2 hover:text-gold-400 transition-colors uppercase text-xs self-start"
                >
                  {card1.button_text} <MoveRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </RevealText>

        <RevealText delay={0.4} className="h-full">
          <div className="h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 hover:border-gold-500/20 transition-all duration-500 flex flex-col group relative overflow-hidden">
            {/* Background image overlay */}
            {card2.image_url && (
              <>
                <img src={card2.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-700 grayscale group-hover:grayscale-[0.5]" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/90 via-midnight-900/50 to-transparent" />
              </>
            )}

            <div className="relative z-10 flex flex-col h-full">
              <h3 className="font-serif text-2xl text-slate-200 mb-4">{card2.title}</h3>
              <p className="text-slate-400 font-light leading-relaxed flex-grow mb-8 text-lg">
                {card2.description}
              </p>
              
              {card2.button_text && (
                <Link 
                  href={card2.button_link || '#'}
                  className="text-gold-500 font-medium tracking-wider flex items-center gap-2 hover:text-gold-400 transition-colors uppercase text-xs self-start"
                >
                  {card2.button_text} <MoveRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </RevealText>
      </div>
    </div>
  );
}
