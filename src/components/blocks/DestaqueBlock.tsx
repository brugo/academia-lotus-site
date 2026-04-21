"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageBlock, DestaqueContent } from "@/lib/types";
import { RevealText } from "@/components/ui/RevealText";
import { BookOpen, Sparkles, MoveRight, X } from "lucide-react";
import Link from "next/link";

export function DestaqueBlock({ block }: { block: PageBlock }) {
  const content = block.content as unknown as DestaqueContent;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                  <>
                    {content.button2_action === 'lightbox' ? (
                      <button 
                        onClick={() => setIsLightboxOpen(true)}
                        className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 text-white rounded-full hover:bg-white/5 transition-all text-sm tracking-wide text-center"
                      >
                        {content.button2_text}
                      </button>
                    ) : (
                      <Link 
                        href={content.button2_link || '#'}
                        className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 text-white rounded-full hover:bg-white/5 transition-all text-sm tracking-wide text-center"
                      >
                        {content.button2_text}
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        </RevealText>
      </div>

      {/* Lightbox Modal rendered via Portal */}
      {isLightboxOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all" aria-modal="true" role="dialog">
          {/* Backdrop Escuro para cobrir todo site (o portal evita que o z-index ou relative dos containeres pais bloqueie) */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" 
            onClick={() => setIsLightboxOpen(false)}
          />
          
          {/* Modal Container Premium */}
          <div className="relative z-10 bg-gradient-to-br from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-2xl md:rounded-3xl shadow-[0_0_80px_-15px_rgba(212,175,55,0.4)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/5">
            
            {/* Fechar */}
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-gold-500/20 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all border border-white/5 hover:border-gold-500/40"
            >
              <X size={20} />
            </button>

            {/* Fundo do modal sutil (Onda Premium) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-midnight-600/10 blur-[100px] pointer-events-none" />

            {/* Conteúdos */}
            <div className="overflow-y-auto w-full custom-scrollbar relative z-10">
              
              {/* === APENAS TEXTO === */}
              {content.lightbox_type === 'text' && (
                <div className="p-8 md:p-14 space-y-6 relative">
                  {content.lightbox_title && (
                    <h3 className="font-serif text-3xl md:text-4xl text-gold-400 mb-6 border-b border-gold-500/10 pb-6 relative inline-block">
                      {content.lightbox_title}
                      <span className="absolute -bottom-[1px] left-0 w-1/3 h-[2px] bg-gold-500"></span>
                    </h3>
                  )}
                  {content.lightbox_text && (
                    <div className="text-slate-300 font-light leading-relaxed space-y-4 whitespace-pre-wrap text-lg opacity-90">
                      {content.lightbox_text}
                    </div>
                  )}
                </div>
              )}

              {/* === IMAGEM + TEXTO === */}
              {content.lightbox_type === 'image_text' && (
                <div className="flex flex-col md:flex-row w-full h-full min-h-[400px]">
                  {content.lightbox_image_url && (
                    <div className="w-full md:w-5/12 h-64 md:h-auto shrink-0 relative bg-black border-r border-white/5">
                      <img 
                        src={content.lightbox_image_url} 
                        alt="Imagem do painel" 
                        className="w-full h-full object-cover opacity-90 sepia-[20%] transition-opacity duration-700 hover:opacity-100 hover:sepia-0" 
                      />
                      {/* Gradient overlay on image */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-midnight-950/90 pointer-events-none md:hidden" />
                      <div className="absolute inset-0 bg-gradient-to-l from-midnight-950/90 md:from-midnight-950 to-transparent pointer-events-none hidden md:block" style={{ width: '20px', right: 0, left: 'auto' }} />
                    </div>
                  )}
                  <div className="p-8 md:p-12 w-full flex flex-col justify-center space-y-6 bg-transparent">
                    {content.lightbox_title && (
                      <h3 className="font-serif text-3xl md:text-4xl text-gold-400 border-b border-gold-500/10 pb-6 relative inline-block self-start">
                        {content.lightbox_title}
                        <span className="absolute -bottom-[1px] left-0 w-2/3 h-[2px] bg-gold-500"></span>
                      </h3>
                    )}
                    {content.lightbox_text && (
                      <div className="text-slate-300 font-light leading-relaxed space-y-4 whitespace-pre-wrap text-lg flex-grow opacity-90">
                        {content.lightbox_text}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === VÍDEO DO YOUTUBE === */}
              {content.lightbox_type === 'video' && (
                <div className="w-full h-full flex flex-col bg-black">
                  {content.lightbox_title && (
                    <div className="p-6 md:p-8 bg-gradient-to-b from-midnight-950 to-midnight-900 border-b border-gold-500/20 relative z-10 flex items-center shadow-xl">
                      <div className="w-1.5 h-6 bg-gold-500 rounded-full mr-4" />
                      <h3 className="font-serif text-2xl md:text-3xl text-gold-400">
                        {content.lightbox_title}
                      </h3>
                    </div>
                  )}
                  <div className="w-full aspect-video bg-black rounded-b-2xl md:rounded-b-3xl overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                    <iframe
                      src={content.lightbox_video_url}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      , document.body)}
    </section>
  );
}
