"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { RevealText } from "@/components/ui/RevealText";
import type { PageBlock, CardSimplesContent, CardItem } from "@/lib/types";
import { Moon, Leaf, Sun, Star, Heart, Flame, Sparkles, Zap, Eye, Shield, Flower2, TreePine, Wind, Droplets, CloudSun, X } from "lucide-react";
import Link from "next/link";

// Helper for dynamic icons
const iconMap: Record<string, React.ReactNode> = {
  Moon: <Moon size={28} className="font-light" />,
  Leaf: <Leaf size={28} className="font-light" />,
  Sun: <Sun size={28} className="font-light" />,
  Star: <Star size={28} className="font-light" />,
  Heart: <Heart size={28} className="font-light" />,
  Flame: <Flame size={28} className="font-light" />,
  Sparkles: <Sparkles size={28} className="font-light" />,
  Zap: <Zap size={28} className="font-light" />,
  Eye: <Eye size={28} className="font-light" />,
  Shield: <Shield size={28} className="font-light" />,
  Flower2: <Flower2 size={28} className="font-light" />,
  TreePine: <TreePine size={28} className="font-light" />,
  Wind: <Wind size={28} className="font-light" />,
  Droplets: <Droplets size={28} className="font-light" />,
  CloudSun: <CloudSun size={28} className="font-light" />,
};

/* ---- Card visual reutilizável ---- */
function CardVisual({ item, index, isMobile }: { item: CardItem; index: number; isMobile?: boolean }) {
  const iconSize = isMobile ? 24 : 28;
  return (
    <>
      {item.image_url && (
        <div className="absolute inset-0 z-0">
          <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale mix-blend-overlay opacity-10 group-hover:grayscale-[0.5] group-hover:opacity-[0.22] group-hover:scale-105 transition-all duration-700 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent opacity-80" />
        </div>
      )}
      {!isMobile && index === 1 && <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[50px] -mr-10 -mt-10 rounded-full" />}

      <div className={`${isMobile ? 'w-14 h-14 mb-6' : 'w-16 h-16 mb-8'} bg-midnight-950 border border-white/5 shadow-inner text-gold-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-all duration-500 relative z-10`}>
        {iconMap[item.icon] || <Moon size={iconSize} className="font-light" />}
      </div>
      <h3 className={`font-serif ${isMobile ? 'text-xl mb-3' : 'text-2xl mb-4'} text-slate-200 tracking-wide relative z-10`}>{item.title}</h3>
      <p className={`text-slate-400 font-light leading-relaxed flex-grow relative z-10 ${isMobile ? 'mb-6' : 'pb-8'}`}>
        {item.description}
      </p>
      <div className="mt-auto pt-4 border-t border-white/5 relative z-10">
        <span className="text-gold-500 font-medium text-xs tracking-widest group-hover:text-gold-400 transition-colors uppercase cursor-pointer">
          Saber Mais
        </span>
      </div>
    </>
  );
}

/* ---- Lightbox Renderer (reutiliza o mesmo padrão do DestaqueBlock) ---- */
function CardLightbox({ item, isOpen, onClose }: { item: CardItem; isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const lbType = item.lightbox_type || 'text';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative z-10 bg-gradient-to-br from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-2xl md:rounded-3xl shadow-[0_0_80px_-15px_rgba(212,175,55,0.4)] w-full max-w-4xl max-h-[90vh] min-h-[200px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-gold-500/20 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all border border-white/5 hover:border-gold-500/40"
        >
          <X size={20} />
        </button>

        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-midnight-600/10 blur-[100px] pointer-events-none" />

        <div data-lenis-prevent="true" className="overflow-y-auto w-full custom-scrollbar relative z-10 flex-grow">
          {/* APENAS TEXTO */}
          {lbType === 'text' && (
            <div className="p-8 md:p-14 space-y-6 relative">
              {item.lightbox_title && (
                <h3 className="font-serif text-3xl md:text-4xl text-gold-400 mb-6 border-b border-gold-500/10 pb-6 relative inline-block">
                  {item.lightbox_title}
                  <span className="absolute -bottom-[1px] left-0 w-1/3 h-[2px] bg-gold-500"></span>
                </h3>
              )}
              {item.lightbox_text && (
                <div className="text-slate-300 font-light leading-relaxed space-y-4 whitespace-pre-wrap text-lg opacity-90">
                  {item.lightbox_text}
                </div>
              )}
            </div>
          )}

          {/* IMAGEM + TEXTO */}
          {lbType === 'image_text' && (
            <div className="flex flex-col md:flex-row w-full h-full min-h-[400px]">
              {item.lightbox_image_url && (
                <div className="w-full md:w-5/12 h-64 md:h-auto shrink-0 relative bg-black border-r border-white/5">
                  <img
                    src={item.lightbox_image_url}
                    alt="Imagem do painel"
                    className="w-full h-full object-cover opacity-90 sepia-[20%] transition-opacity duration-700 hover:opacity-100 hover:sepia-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-midnight-950/90 pointer-events-none md:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-l from-midnight-950/90 md:from-midnight-950 to-transparent pointer-events-none hidden md:block" style={{ width: '20px', right: 0, left: 'auto' }} />
                </div>
              )}
              <div className="p-8 md:p-12 w-full flex flex-col justify-center space-y-6 bg-transparent">
                {item.lightbox_title && (
                  <h3 className="font-serif text-3xl md:text-4xl text-gold-400 border-b border-gold-500/10 pb-6 relative inline-block self-start">
                    {item.lightbox_title}
                    <span className="absolute -bottom-[1px] left-0 w-2/3 h-[2px] bg-gold-500"></span>
                  </h3>
                )}
                {item.lightbox_text && (
                  <div className="text-slate-300 font-light leading-relaxed space-y-4 whitespace-pre-wrap text-lg flex-grow opacity-90">
                    {item.lightbox_text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VÍDEO */}
          {lbType === 'video' && (
            <div className="w-full h-full flex flex-col bg-black">
              {item.lightbox_title && (
                <div className="p-6 md:p-8 bg-gradient-to-b from-midnight-950 to-midnight-900 border-b border-gold-500/20 relative z-10 flex items-center shadow-xl">
                  <div className="w-1.5 h-6 bg-gold-500 rounded-full mr-4" />
                  <h3 className="font-serif text-2xl md:text-3xl text-gold-400">
                    {item.lightbox_title}
                  </h3>
                </div>
              )}
              <div className="w-full aspect-video bg-black rounded-b-2xl md:rounded-b-3xl overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                <iframe
                  src={item.lightbox_video_url}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* NARRATIVA AVANÇADA */}
          {lbType === 'custom_blocks' && (
            <div className="p-8 md:p-14 relative pb-24">
              {item.lightbox_title && (
                <h3 className="font-serif text-3xl md:text-4xl text-gold-400 mb-10 border-b border-gold-500/10 pb-6 relative inline-block">
                  {item.lightbox_title}
                  <span className="absolute -bottom-[1px] left-0 w-1/3 h-[2px] bg-gold-500"></span>
                </h3>
              )}
              <div className="space-y-10 flex flex-col items-center">
                {(item.lightbox_blocks || []).map(block =>
                  block.type === 'text' ? (
                    <div key={block.id} className="text-slate-300 font-light leading-relaxed whitespace-pre-wrap text-lg opacity-90 w-full text-justify md:text-left">
                      {block.content}
                    </div>
                  ) : block.content ? (
                    <div key={block.id} className="w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 border-gold-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] my-6">
                      <img
                        src={block.content}
                        alt=""
                        className="w-full h-auto object-cover sepia-[10%] hover:sepia-0 transition-all duration-700 hover:scale-[1.02]"
                      />
                    </div>
                  ) : null
                )}
                {(item.lightbox_blocks || []).length === 0 && (
                  <p className="text-slate-500 italic font-light">Nenhum conteúdo adicionado nesta narrativa.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}


export function CardSimplesBlock({ block }: { block: PageBlock }) {
  const content = (block.content as unknown) as CardSimplesContent;
  const items = content.items || [];
  const [openLightboxIdx, setOpenLightboxIdx] = useState<number | null>(null);

  const cardClasses = (index: number) =>
    `block h-full bg-midnight-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-10 hover:bg-midnight-800/50 hover:border-gold-500/20 transition-all duration-500 group flex flex-col relative overflow-hidden`;

  const mobileCardClasses =
    `group bg-midnight-900/40 border border-white/5 rounded-3xl p-8 flex flex-col h-full hover:bg-midnight-800/50 hover:border-gold-500/20 transition-all relative overflow-hidden`;

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block py-32 relative z-10 bg-midnight-950/80 backdrop-blur-xl w-full">
        <div className="container mx-auto px-6">
          <div className="text-center md:max-w-4xl mx-auto mb-24">
            <RevealText element="h2" className="font-serif text-3xl md:text-5xl text-gold-400 mb-8">
              {content.title || "Atravesse o Limiar da Cura"}
            </RevealText>
            <RevealText delay={0.2} className="w-12 h-[1px] bg-gold-500/50 mx-auto mb-8"></RevealText>
            <RevealText delay={0.3} element="p" className="text-slate-400 text-xl font-light leading-relaxed">
              {content.subtitle || "Deixe que nossas egrégoras de luz amparem você através dos sagrados ensinamentos."}
            </RevealText>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto px-4">
            {items.map((item, index) => (
              <RevealText key={index} delay={0.1 + (index * 0.2)} className={`h-full ${index === 1 ? 'mt-0 md:mt-12' : index === 2 ? 'mt-0 md:mt-24' : ''}`}>
                {item.action_type === 'lightbox' ? (
                  <button
                    onClick={() => setOpenLightboxIdx(index)}
                    className={`${cardClasses(index)} text-left w-full cursor-pointer`}
                  >
                    <CardVisual item={item} index={index} />
                  </button>
                ) : (
                  <Link href={item.link || '/atendimentos'} className={cardClasses(index)}>
                    <CardVisual item={item} index={index} />
                  </Link>
                )}
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE (HTML PURO) */}
      <section className="md:hidden py-16 relative z-10 bg-midnight-950/80 w-full">
        <div className="container mx-auto px-6">
          <div className="text-center mx-auto mb-12">
            <h2 className="font-serif text-3xl text-gold-400 mb-6">{content.title}</h2>
            <div className="w-12 h-[1px] bg-gold-500/50 mx-auto mb-6"></div>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              {content.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
             {items.map((item, index) => (
               item.action_type === 'lightbox' ? (
                 <button
                   key={index}
                   onClick={() => setOpenLightboxIdx(index)}
                   className={`${mobileCardClasses} text-left w-full cursor-pointer`}
                 >
                   <CardVisual item={item} index={index} isMobile />
                 </button>
               ) : (
                 <Link href={item.link || '/atendimentos'} key={index} className={mobileCardClasses}>
                   <CardVisual item={item} index={index} isMobile />
                 </Link>
               )
             ))}
          </div>
        </div>
      </section>

      {/* Lightbox para o card ativo */}
      {openLightboxIdx !== null && items[openLightboxIdx] && (
        <CardLightbox
          item={items[openLightboxIdx]}
          isOpen={true}
          onClose={() => setOpenLightboxIdx(null)}
        />
      )}
    </>
  );
}
