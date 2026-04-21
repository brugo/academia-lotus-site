"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageBlock, DuploCardContent, DuploCardItem } from "@/lib/types";
import { RevealText } from "@/components/ui/RevealText";
import { MoveRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DuploCardBlock({ block }: { block: PageBlock }) {
  const content = block.content as unknown as DuploCardContent;
  const card1 = content.card1;
  const card2 = content.card2;
  
  const [openLightboxId, setOpenLightboxId] = useState<1 | 2 | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (openLightboxId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openLightboxId]);

  if (!card1 || !card2) return null;

  const handleCardClick = (card: DuploCardItem, id: 1 | 2) => {
    if (card.action_type === 'lightbox') {
      setOpenLightboxId(id);
    } else {
      router.push(card.button_link || '#');
    }
  };

  const renderCardInner = (card: DuploCardItem) => (
    <>
      {/* Background image overlay with purple vibe */}
      {card.image_url && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
          <img src={card.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:opacity-40 transition-all duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-purple-900/40 mix-blend-color pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/60 to-transparent pointer-events-none" />
        </div>
      )}
      
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <h3 className="font-serif text-2xl text-slate-200 mb-4">{card.title}</h3>
        <p className="text-slate-400 font-light leading-relaxed flex-grow mb-8 text-lg">
          {card.description}
        </p>
        
        {card.button_text && (
          <div className="text-gold-500 font-medium tracking-wider flex items-center gap-2 group-hover:text-gold-400 transition-colors uppercase text-xs self-start mt-auto">
            {card.button_text} <MoveRight size={16} />
          </div>
        )}
      </div>
    </>
  );

  const activeCard = openLightboxId === 1 ? card1 : openLightboxId === 2 ? card2 : null;

  return (
    <div className="w-full relative z-10 py-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        <RevealText delay={0.2} className="h-full">
          <button 
            onClick={() => handleCardClick(card1, 1)}
            className="w-full text-left h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 hover:border-gold-500/30 transition-all duration-500 flex flex-col group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            {renderCardInner(card1)}
          </button>
        </RevealText>

        <RevealText delay={0.4} className="h-full">
          <button 
            onClick={() => handleCardClick(card2, 2)}
            className="w-full text-left h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 hover:border-gold-500/30 transition-all duration-500 flex flex-col group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            {renderCardInner(card2)}
          </button>
        </RevealText>

      </div>

      {/* Lightbox Modal rendered via Portal */}
      {openLightboxId && activeCard && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all" aria-modal="true" role="dialog">
          {/* Backdrop Escuro */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" 
            onClick={() => setOpenLightboxId(null)}
          />
          
          {/* Modal Container Premium */}
          <div className="relative z-10 bg-gradient-to-br from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-2xl md:rounded-3xl shadow-[0_0_80px_-15px_rgba(212,175,55,0.4)] w-full max-w-4xl max-h-[90vh] min-h-[200px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/5">
            
            {/* Fechar */}
            <button 
              onClick={() => setOpenLightboxId(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-gold-500/20 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all border border-white/5 hover:border-gold-500/40"
            >
              <X size={20} />
            </button>

            {/* Fundo do modal sutil (Onda Premium) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-midnight-600/10 blur-[100px] pointer-events-none" />

            {/* Conteúdos */}
            <div data-lenis-prevent="true" className="overflow-y-auto w-full custom-scrollbar relative z-10 flex-grow">
              
              {/* === APENAS TEXTO === */}
              {(!activeCard.lightbox_type || activeCard.lightbox_type === 'text') && (
                <div className="p-8 md:p-14 space-y-6 relative">
                  {activeCard.lightbox_title && (
                    <h3 className="font-serif text-3xl md:text-4xl text-gold-400 mb-6 border-b border-gold-500/10 pb-6 relative inline-block">
                      {activeCard.lightbox_title}
                      <span className="absolute -bottom-[1px] left-0 w-1/3 h-[2px] bg-gold-500"></span>
                    </h3>
                  )}
                  {activeCard.lightbox_text && (
                    <div className="text-slate-300 font-light leading-relaxed space-y-4 whitespace-pre-wrap text-lg opacity-90">
                      {activeCard.lightbox_text}
                    </div>
                  )}
                </div>
              )}

              {/* === IMAGEM + TEXTO === */}
              {activeCard.lightbox_type === 'image_text' && (
                <div className="flex flex-col md:flex-row w-full h-full min-h-[400px]">
                  {activeCard.lightbox_image_url && (
                    <div className="w-full md:w-5/12 h-64 md:h-auto shrink-0 relative bg-black border-r border-white/5">
                      <img 
                        src={activeCard.lightbox_image_url} 
                        alt="Imagem do painel" 
                        className="w-full h-full object-cover opacity-90 sepia-[20%] transition-opacity duration-700 hover:opacity-100 hover:sepia-0" 
                      />
                      {/* Gradient overlay on image */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-midnight-950/90 pointer-events-none md:hidden" />
                      <div className="absolute inset-0 bg-gradient-to-l from-midnight-950/90 md:from-midnight-950 to-transparent pointer-events-none hidden md:block" style={{ width: '20px', right: 0, left: 'auto' }} />
                    </div>
                  )}
                  <div className="p-8 md:p-12 w-full flex flex-col justify-center space-y-6 bg-transparent">
                    {activeCard.lightbox_title && (
                      <h3 className="font-serif text-3xl md:text-4xl text-gold-400 border-b border-gold-500/10 pb-6 relative inline-block self-start">
                        {activeCard.lightbox_title}
                        <span className="absolute -bottom-[1px] left-0 w-2/3 h-[2px] bg-gold-500"></span>
                      </h3>
                    )}
                    {activeCard.lightbox_text && (
                      <div className="text-slate-300 font-light leading-relaxed space-y-4 whitespace-pre-wrap text-lg flex-grow opacity-90">
                        {activeCard.lightbox_text}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === VÍDEO DO YOUTUBE === */}
              {activeCard.lightbox_type === 'video' && (
                <div className="w-full h-full flex flex-col bg-black">
                  {activeCard.lightbox_title && (
                    <div className="p-6 md:p-8 bg-gradient-to-b from-midnight-950 to-midnight-900 border-b border-gold-500/20 relative z-10 flex items-center shadow-xl">
                      <div className="w-1.5 h-6 bg-gold-500 rounded-full mr-4" />
                      <h3 className="font-serif text-2xl md:text-3xl text-gold-400">
                        {activeCard.lightbox_title}
                      </h3>
                    </div>
                  )}
                  <div className="w-full aspect-video bg-black rounded-b-2xl md:rounded-b-3xl overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                    <iframe
                      src={activeCard.lightbox_video_url}
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

    </div>
  );
}
