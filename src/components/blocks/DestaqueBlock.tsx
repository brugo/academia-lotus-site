"use client";

import { PageBlock, DestaqueContent } from "@/lib/types";
import { RevealText } from "@/components/ui/RevealText";
import { BookOpen, Sparkles, MoveRight } from "lucide-react";
import Link from "next/link";

export function DestaqueBlock({ block }: { block: PageBlock }) {
  const content = block.content as unknown as DestaqueContent;

  return (
    <section className="w-full relative z-10 py-24 px-6 bg-midnight-950/80 backdrop-blur-xl">
      <div className="container mx-auto">
        <RevealText delay={0.2}>
          <div className="bg-midnight-900/40 backdrop-blur-xl border border-gold-500/10 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 hover:border-gold-500/30 transition-colors duration-500 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
          
          <div className="w-full md:w-1/3 flex justify-center relative z-10 shrink-0">
            {block.image_url ? (
               // Using a standard img tag because next/image needs absolute height/width or fill with position relative parent, and a raw URL from DB might have varied dimensions.
              <img 
                src={block.image_url} 
                alt={content.title} 
                className="w-64 max-w-full rounded-lg shadow-2xl border border-gold-500/20 group-hover:scale-[1.02] transition-transform duration-500 object-cover" 
              />
            ) : (
              <div className="w-48 h-64 md:w-64 md:h-80 bg-midnight-950 border border-gold-500/20 rounded-lg shadow-2xl flex items-center justify-center relative group-hover:border-gold-500/40 transition-colors duration-500 overflow-hidden">
                <BookOpen size={48} className="text-gold-500/50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-center pointer-events-none">
                  <p className="font-serif text-gold-400 text-sm mb-1 uppercase tracking-widest">{content.tag}</p>
                  <p className="text-white text-lg font-medium leading-tight">{content.title}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-2/3 flex flex-col relative z-10 text-center md:text-left">
            {content.tag && (
              <div className="inline-flex items-center justify-center md:justify-start gap-2 text-gold-400 text-xs font-medium tracking-widest uppercase mb-4">
                <Sparkles size={14} /> {content.tag}
              </div>
            )}
            
            <h2 className="font-serif text-3xl md:text-4xl text-slate-100 mb-6">{content.title}</h2>
            <p className="text-slate-400 font-light leading-relaxed mb-8 text-lg">
              {content.description}
            </p>
            
            {(content.show_button1 || content.show_button2) && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {content.show_button1 && content.button1_text && (
                  <Link 
                    href={content.button1_link || '#'}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 rounded-full hover:from-gold-500 hover:to-gold-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] font-medium tracking-wide flex items-center justify-center gap-2"
                  >
                    {content.button1_text}
                    <MoveRight size={18} />
                  </Link>
                )}
                {content.show_button2 && content.button2_text && (
                  <Link 
                    href={content.button2_link || '#'}
                    className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 text-white rounded-full hover:bg-white/5 transition-all text-sm tracking-wide text-center"
                  >
                    {content.button2_text}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        </RevealText>
      </div>
    </section>
  );
}
